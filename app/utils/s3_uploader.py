import os
import uuid
import boto3
from fastapi import UploadFile

s3_client = boto3.client(
    "s3",
    region_name=os.getenv("AWS_REGION", "us-east-1"),
)

BUCKET = os.getenv("S3_BUCKET_NAME")


async def subir_imagen_a_s3(file: UploadFile) -> str:
    ext = file.filename.split(".")[-1] if file.filename else "jpg"
    key = f"productos/{uuid.uuid4()}.{ext}"
    s3_client.upload_fileobj(
        file.file,
        BUCKET,
        key,
        ExtraArgs={"ACL": "public-read"},
    )
    return f"https://{BUCKET}.s3.amazonaws.com/{key}"
