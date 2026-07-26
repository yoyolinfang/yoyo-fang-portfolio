"""Feature-level VADER sentiment pipeline for AI smart glasses reviews."""

import pandas as pd
import statsmodels.formula.api as smf
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer


# Load and combine the two product datasets.
meta = pd.read_excel("meta_reviews.xlsx")
wayfarer = pd.read_excel("wayfarer_reviews.xlsx")

meta["product_group"] = "MetaBlank"
wayfarer["product_group"] = "Wayfarer"

reviews = pd.concat([meta, wayfarer], ignore_index=True)


# Set up VADER and feature keyword dictionaries.
analyzer = SentimentIntensityAnalyzer()

feature_words = {
    "battery": [
        "battery",
        "charge",
        "charging",
        "power",
        "battery life",
        "drain",
        "drains",
        "lasts",
        "lasting",
    ],
    "camera": [
        "camera",
        "photo",
        "photos",
        "picture",
        "pictures",
        "video",
        "videos",
        "record",
        "recording",
        "capture",
    ],
    "audio": [
        "sound",
        "audio",
        "speaker",
        "music",
        "call",
        "calls",
        "mic",
        "microphone",
        "volume",
    ],
    "smart": [
        "ai",
        "meta ai",
        "assistant",
        "voice",
        "translate",
        "translation",
        "smart",
        "hands free",
        "command",
        "app",
    ],
}


def feature_sentiment(text, keywords):
    """Return positive (1), neutral/no mention (0), or negative (-1)."""
    text = str(text).lower()

    if not any(word in text for word in keywords):
        return 0

    compound = analyzer.polarity_scores(text)["compound"]

    if compound > 0.05:
        return 1
    if compound < -0.05:
        return -1
    return 0


# Generate one sentiment variable for each product feature.
for feature, keywords in feature_words.items():
    reviews[f"{feature}_sent"] = reviews["review_text"].apply(
        lambda text, words=keywords: feature_sentiment(text, words)
    )


# Inspect the distribution of extracted feature sentiment.
sentiment_columns = [
    "battery_sent",
    "camera_sent",
    "audio_sent",
    "smart_sent",
]

print(reviews[sentiment_columns].apply(lambda column: column.value_counts()))


# Model 1: pooled feature-sentiment model.
model_1 = smf.ols(
    "rating ~ battery_sent + camera_sent + audio_sent + smart_sent",
    data=reviews,
).fit()

print(model_1.summary())


# Model 2: control for fixed differences between product groups.
model_2 = smf.ols(
    (
        "rating ~ battery_sent + camera_sent + "
        "audio_sent + smart_sent + C(product_group)"
    ),
    data=reviews,
).fit()

print(model_2.summary())


# Save the processed dataset for follow-up analysis.
reviews.to_excel("smart_glasses_reviews_processed.xlsx", index=False)
