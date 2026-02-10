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
# Mosques Routes
# ==================================================================================================


@app.get("/v1/mosques")
def get_mosques_list() -> dict:
    """
    Get the mosques by city
    """
    response = {"message": "List of mosques for the city"}

    return RESPONSE(response)


@app.get("/v1/mosques/<mosque_id>")
def get_mosque_by_id(mosque_id: str) -> dict:
    """
    Get a mosque by id
    """
    response = {"message": f"Get a mosque by id {mosque_id}"}
    return RESPONSE(response)


@app.post("/v1/mosques")
def create_mosque() -> dict:
    """
    Create a mosque
    """
    response = {"message": "Create a mosque"}
    return RESPONSE(response)


@app.patch("/v1/mosques/<mosque_id>")
def update_mosque_by_id(mosque_id: str) -> dict:
    """
    Update a mosque by id
    """
    response = {"message": f"Update a mosque by id {mosque_id}"}
    return RESPONSE(response)


@app.delete("/v1/mosques/<mosque_id>")
def delete_mosque_by_id(mosque_id: str) -> dict:
    """
    Delete a mosque by id
    """
    response = {"message": f"Delete a mosque by id {mosque_id}"}
    return RESPONSE(response)


@app.get("/v1/mosques/<mosque_id>/spocs")
def get_mosque_spocs(mosque_id: str) -> dict:
    """
    Get the spocs of a mosque by id
    """
    response = {"message": f"Get the spocs of a mosque by id {mosque_id}"}
    return RESPONSE(response)


@app.post("/v1/mosques/<mosque_id>/spocs")
def create_mosque_spoc(mosque_id: str) -> dict:
    """
    Create a spoc for a mosque by id
    """
    response = {"message": f"Create a spoc for a mosque by id {mosque_id}"}
    return RESPONSE(response)


@app.delete("/v1/mosques/<mosque_id>/spocs/<spoc_id>")
def delete_mosque_spoc(mosque_id: str, spoc_id: str) -> dict:
    """
    Delete a spoc for a mosque by id
    """
    response = {"message": f"Delete a spoc for a mosque by id {mosque_id} and spoc id {spoc_id}"}
    return RESPONSE(response)


# ==================================================================================================
# Appointment Routes
# ==================================================================================================


@app.get("/v1/appointments")
def get_appointments() -> dict:
    """
    Get the appointments
    """
    response = {"message": "Get the appointments"}
    return RESPONSE(response)


@app.get("/v1/appointments/<appointment_id>")
def get_appointment_by_id(appointment_id: str) -> dict:
    """
    Get an appointment by id
    """
    response = {"message": f"Get an appointment by id {appointment_id}"}
    return RESPONSE(response)


@app.post("/v1/appointments")
def create_appointment() -> dict:
    """
    Create an appointment
    """
    response = {"message": "Create an appointment"}
    return RESPONSE(response)


@app.patch("/v1/appointments/<appointment_id>")
def update_appointment_by_id(appointment_id: str) -> dict:
    """
    Update an appointment by id
    """
    response = {"message": f"Update an appointment by id {appointment_id}"}
    return RESPONSE(response)


@app.delete("/v1/appointments/<appointment_id>")
def delete_appointment_by_id(appointment_id: str) -> dict:
    """
    Delete an appointment by id
    """
    response = {"message": f"Delete an appointment by id {appointment_id}"}
    return RESPONSE(response)


# ==================================================================================================
# USER REQUEST ROUTES
# ==================================================================================================


@app.get("/v1/user-requests")
def get_user_requests() -> dict:
    """
    Get all user requests
    """
    response = {"message": "Get all user requests"}
    return RESPONSE(response)


@app.get("/v1/user-requests/<user_request_id>")
def get_user_request_by_id(user_request_id: str) -> dict:
    """
    Get a user request by id
    """
    response = {"message": f"Get a user request by id {user_request_id}"}
    return RESPONSE(response)


@app.post("/v1/user-requests")
def create_user_request() -> dict:
    """
    Create a user request
    """
    response = {"message": "Create a user request"}
    return RESPONSE(response)


@app.patch("/v1/user-requests/<user_request_id>")
def update_user_request_by_id(user_request_id: str) -> dict:
    """
    Update a user request by id
    """
    response = {"message": f"Update a user request by id {user_request_id}"}
    return RESPONSE(response)


@app.delete("/v1/user-requests/<user_request_id>")
def delete_user_request_by_id(user_request_id: str) -> dict:
    """
    Delete a user request by id
    """
    response = {"message": f"Delete a user request by id {user_request_id}"}
    return RESPONSE(response)


# ==================================================================================================
# Admin Utility Routes
# ==================================================================================================


@app.post("/v1/admin/<user_request_id>/schedule")
def schedule_user_request(user_request_id: str) -> dict:
    """
    Schedule a user request by id
    """
    response = {"message": f"Schedule a user request by id {user_request_id}"}
    return RESPONSE(response)


@app.patch("/v1/admin/<user_request_id>/schedule")
def update_user_request_schedule(user_request_id: str) -> dict:
    """
    Update a user request schedule by id
    """
    response = {"message": f"Update a user request schedule by id {user_request_id}"}
    return RESPONSE(response)


@app.delete("/v1/admin/<user_request_id>/schedule")
def delete_user_request_schedule(user_request_id: str) -> dict:
    """
    Delete a user request schedule by id
    """
    response = {"message": f"Delete a user request schedule by id {user_request_id}"}
    return RESPONSE(response)


def handler(event: dict, context: LambdaContext) -> dict:
    """
    The lambda handler method: It resolves the proxy route and invokes the appropriate method
    """

    logger.info(event)
    return app.resolve(event, context)
