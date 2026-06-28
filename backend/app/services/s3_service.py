import boto3
from botocore.exceptions import ClientError
from fastapi import UploadFile
import uuid
from app.core.config import get_settings

settings = get_settings()


def get_s3_client():
    return boto3.client(
        "s3",
        aws_access_key_id=settings.aws_access_key_id,
        aws_secret_access_key=settings.aws_secret_access_key,
        region_name=settings.aws_region,
    )


async def upload_file_to_s3(file: UploadFile, prefix: str = "docs") -> str:
    """Upload a file to S3. Returns the S3 key."""
    s3 = get_s3_client()
    ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "bin"
    key = f"{prefix}/{uuid.uuid4()}.{ext}"

    content = await file.read()
    s3.put_object(
        Bucket=settings.s3_bucket_name,
        Key=key,
        Body=content,
        ContentType=file.content_type or "application/octet-stream",
    )
    return key


def get_presigned_url(s3_key: str, expiry: int = 3600) -> str:
    """Generate a presigned URL for downloading."""
    s3 = get_s3_client()
    try:
        url = s3.generate_presigned_url(
            "get_object",
            Params={"Bucket": settings.s3_bucket_name, "Key": s3_key},
            ExpiresIn=expiry,
        )
        return url
    except ClientError:
        return ""


def download_from_s3(s3_key: str) -> bytes:
    """Download file bytes from S3."""
    s3 = get_s3_client()
    response = s3.get_object(Bucket=settings.s3_bucket_name, Key=s3_key)
    return response["Body"].read()


def delete_from_s3(s3_key: str) -> bool:
    s3 = get_s3_client()
    try:
        s3.delete_object(Bucket=settings.s3_bucket_name, Key=s3_key)
        return True
    except ClientError:
        return False
