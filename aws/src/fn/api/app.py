"""
# --*-- coding: utf-8 --*--
# This module defines the REST API routes
"""

# ==================================================================================================
# Python imports

from os import getenv

# ==================================================================================================
# AWS imports
from aws_lambda_powertools.event_handler import APIGatewayRestResolver, CORSConfig
from aws_lambda_powertools.utilities.typing import LambdaContext

# ==================================================================================================
# Module imports
from shared.lambda_response import RESPONSE
from shared.logger import logger

# ==================================================================================================
# Global declarations
PAGE_SIZE = int(getenv("PAGE_SIZE", "50"))

cors_config = CORSConfig(
    allow_origin="*",
    allow_headers=["*"],
)

app = APIGatewayRestResolver(enable_validation=True, cors=cors_config)

app.enable_swagger(
    path="/docs",
    title="API for kaleening",
    version="1.0.0",
    description="API for fetching mosques by city for kaleening",
)


# ==================================================================================================
# Mosque Routes
# ==================================================================================================

@app.get("/mosques")
def get_mosques() -> dict:
    """
    Get all mosques
    """
    return RESPONSE.success(data={"mosques": []})



# ==================================================================================================
# Main Handler
# ==================================================================================================


def handler(event: dict, context: LambdaContext) -> dict:
    """
    The lambda handler method: It resolves the proxy route and invokes the appropriate method
    """

    logger.info(event)
    return app.resolve(event, context)
