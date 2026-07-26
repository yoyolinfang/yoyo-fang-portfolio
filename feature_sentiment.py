"""Final analysis pipeline for AI smart glasses review sentiment."""

import re

import numpy as np
import pandas as pd
import statsmodels.formula.api as smf
from statsmodels.miscmodels.ordinal_model import OrderedModel
from statsmodels.stats.outliers_influence import variance_inflation_factor
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer


# ---------------------------------------------------------------------------
# 1. Load and clean Gen 1 and Gen 2 review data
# ---------------------------------------------------------------------------

gen1 = pd.read_excel("gen1_final.xlsx")
gen2 = pd.read_excel("gen2_final.xlsx")

for frame in (gen1, gen2):
    frame.columns = frame.columns.str.strip()

gen1 = gen1[["rating", "review_text"]].copy()
gen2 = gen2[["rating", "review_text"]].copy()

for frame in (gen1, gen2):
    frame.dropna(subset=["rating", "review_text"], inplace=True)
    frame["rating"] = pd.to_numeric(frame["rating"], errors="coerce")
    frame.dropna(subset=["rating"], inplace=True)
    frame["review_text"] = frame["review_text"].astype(str).str.strip()
    frame.drop_duplicates(subset=["rating", "review_text"], inplace=True)

gen1["product_group"] = "Gen1"
gen2["product_group"] = "Gen2"

reviews = pd.concat([gen1, gen2], ignore_index=True)


# ---------------------------------------------------------------------------
# 2. Define feature dictionaries and sentence-level VADER functions
# ---------------------------------------------------------------------------

analyzer = SentimentIntensityAnalyzer()

feature_words = {
    "battery": [
        "battery",
        "batteries",
        "battery life",
        "charge",
        "charges",
        "charged",
        "charging",
        "power",
        "lasts",
        "lasting",
        "drain",
        "drains",
        "drained",
        "dies",
        "dead",
        "recharge",
        "recharging",
    ],
    "camera": [
        "camera",
        "cameras",
        "photo",
        "photos",
        "picture",
        "pictures",
        "video",
        "videos",
        "record",
        "records",
        "recorded",
        "recording",
        "capture",
        "captured",
        "image",
        "images",
        "filming",
        "film",
    ],
    "audio": [
        "sound",
        "audio",
        "speaker",
        "speakers",
        "music",
        "call",
        "calls",
        "phone call",
        "phone calls",
        "listen",
        "listening",
        "podcast",
        "podcasts",
        "volume",
        "mic",
        "microphone",
        "hear",
        "hearing",
    ],
    "smart": [
        "ai",
        "meta ai",
        "assistant",
        "voice",
        "voice command",
        "voice control",
        "translate",
        "translation",
        "translator",
        "smart",
        "hands free",
        "hands-free",
        "ask meta",
    ],
}


def split_sentences(text):
    """Split a review into sentences without requiring NLTK resources."""
    text = str(text).strip()
    if not text:
        return []
    sentences = re.split(r"(?<=[.!?])\s+", text)
    return [sentence.strip() for sentence in sentences if sentence.strip()]


def contains_keyword(sentence, keywords, feature_name=None):
    """Return True when a sentence mentions the specified feature."""
    sentence_lower = str(sentence).lower()

    # Match AI as a complete word, avoiding false matches in words such as paid.
    if feature_name == "smart" and re.search(r"\bai\b", sentence_lower):
        return True

    return any(
        word in sentence_lower
        for word in keywords
        if word != "ai"
    )


def feature_sentiment_sentence(text, keywords, feature_name=None):
    """Score only the sentences that mention the relevant feature."""
    relevant_sentences = [
        sentence
        for sentence in split_sentences(text)
        if contains_keyword(sentence, keywords, feature_name)
    ]

    # Zero represents either no mention or neutral feature sentiment.
    if not relevant_sentences:
        return 0

    feature_text = " ".join(relevant_sentences)
    compound_score = analyzer.polarity_scores(feature_text)["compound"]

    if compound_score > 0.05:
        return 1
    if compound_score < -0.05:
        return -1
    return 0


def feature_mentioned(text, keywords, feature_name=None):
    """Create a separate indicator for whether a feature was mentioned."""
    return int(
        any(
            contains_keyword(sentence, keywords, feature_name)
            for sentence in split_sentences(text)
        )
    )


for feature, keywords in feature_words.items():
    reviews[f"{feature}_sent_s"] = reviews["review_text"].apply(
        lambda text, words=keywords, name=feature:
        feature_sentiment_sentence(text, words, name)
    )
    reviews[f"{feature}_mention"] = reviews["review_text"].apply(
        lambda text, words=keywords, name=feature:
        feature_mentioned(text, words, name)
    )


# ---------------------------------------------------------------------------
# 3. Main sentence-level OLS models
# ---------------------------------------------------------------------------

model_1 = smf.ols(
    "rating ~ battery_sent_s + camera_sent_s + audio_sent_s + smart_sent_s",
    data=reviews,
).fit()

model_2 = smf.ols(
    (
        "rating ~ battery_sent_s + camera_sent_s + "
        "audio_sent_s + smart_sent_s + C(product_group)"
    ),
    data=reviews,
).fit()

print(model_1.summary())
print(model_2.summary())


# HC3 robust standard errors for the main specifications.
model_1_hc3 = model_1.get_robustcov_results(cov_type="HC3")
model_2_hc3 = model_2.get_robustcov_results(cov_type="HC3")

print(model_1_hc3.summary())
print(model_2_hc3.summary())


# ---------------------------------------------------------------------------
# 4. Multicollinearity check
# ---------------------------------------------------------------------------

vif_x = reviews[
    ["battery_sent_s", "camera_sent_s", "audio_sent_s", "smart_sent_s"]
].copy()
vif_x["constant"] = 1

vif_table = pd.DataFrame(
    {
        "Variable": vif_x.columns,
        "VIF": [
            variance_inflation_factor(vif_x.values, index)
            for index in range(vif_x.shape[1])
        ],
    }
)
vif_table = vif_table[vif_table["Variable"] != "constant"]
print(vif_table.round(4))


# ---------------------------------------------------------------------------
# 5. Generation-by-feature interaction model
# ---------------------------------------------------------------------------

interaction_model = smf.ols(
    (
        "rating ~ (battery_sent_s + camera_sent_s + "
        "audio_sent_s + smart_sent_s) * C(product_group)"
    ),
    data=reviews,
).fit()

print(interaction_model.summary())

joint_interaction_test = interaction_model.f_test(
    """
    battery_sent_s:C(product_group)[T.Gen2] = 0,
    camera_sent_s:C(product_group)[T.Gen2] = 0,
    audio_sent_s:C(product_group)[T.Gen2] = 0,
    smart_sent_s:C(product_group)[T.Gen2] = 0
    """
)
print(joint_interaction_test)


# ---------------------------------------------------------------------------
# 6. Whole-review sentiment robustness check
# ---------------------------------------------------------------------------

def feature_sentiment_whole_review(text, keywords, feature_name=None):
    """Apply VADER to the whole review when it mentions a feature."""
    if not feature_mentioned(text, keywords, feature_name):
        return 0

    compound_score = analyzer.polarity_scores(str(text))["compound"]

    if compound_score > 0.05:
        return 1
    if compound_score < -0.05:
        return -1
    return 0


for feature, keywords in feature_words.items():
    reviews[f"{feature}_sent_whole"] = reviews["review_text"].apply(
        lambda text, words=keywords, name=feature:
        feature_sentiment_whole_review(text, words, name)
    )

whole_review_model = smf.ols(
    (
        "rating ~ battery_sent_whole + camera_sent_whole + "
        "audio_sent_whole + smart_sent_whole + C(product_group)"
    ),
    data=reviews,
).fit()

print(whole_review_model.summary())


# ---------------------------------------------------------------------------
# 7. Ordered-logit robustness check for the ordinal star-rating outcome
# ---------------------------------------------------------------------------

ordinal_x = reviews[
    ["battery_sent_s", "camera_sent_s", "audio_sent_s", "smart_sent_s"]
].copy()
ordinal_x["gen2_dummy"] = (reviews["product_group"] == "Gen2").astype(int)
ordinal_y = reviews["rating"].astype(int)

ordered_model = OrderedModel(ordinal_y, ordinal_x, distr="logit")
ordered_result = ordered_model.fit(method="bfgs", disp=False)

print(ordered_result.summary())


# ---------------------------------------------------------------------------
# 8. Export processed data and compact result tables
# ---------------------------------------------------------------------------

main_results = pd.DataFrame(
    {
        "Variable": [
            "Battery Sentiment",
            "Camera Sentiment",
            "Audio Sentiment",
            "Smart Sentiment",
            "Gen2 Dummy",
        ],
        "Model 1 Coef": [
            model_1.params.get("battery_sent_s", np.nan),
            model_1.params.get("camera_sent_s", np.nan),
            model_1.params.get("audio_sent_s", np.nan),
            model_1.params.get("smart_sent_s", np.nan),
            np.nan,
        ],
        "Model 1 P": [
            model_1.pvalues.get("battery_sent_s", np.nan),
            model_1.pvalues.get("camera_sent_s", np.nan),
            model_1.pvalues.get("audio_sent_s", np.nan),
            model_1.pvalues.get("smart_sent_s", np.nan),
            np.nan,
        ],
        "Model 2 Coef": [
            model_2.params.get("battery_sent_s", np.nan),
            model_2.params.get("camera_sent_s", np.nan),
            model_2.params.get("audio_sent_s", np.nan),
            model_2.params.get("smart_sent_s", np.nan),
            model_2.params.get("C(product_group)[T.Gen2]", np.nan),
        ],
        "Model 2 P": [
            model_2.pvalues.get("battery_sent_s", np.nan),
            model_2.pvalues.get("camera_sent_s", np.nan),
            model_2.pvalues.get("audio_sent_s", np.nan),
            model_2.pvalues.get("smart_sent_s", np.nan),
            model_2.pvalues.get("C(product_group)[T.Gen2]", np.nan),
        ],
    }
)

reviews.to_excel("smart_glasses_processed_data.xlsx", index=False)
main_results.to_excel("smart_glasses_main_results.xlsx", index=False)
