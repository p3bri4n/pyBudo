from typing import TypedDict


class AgentState(TypedDict):
    level_spec: dict
    generated_code: str
    rejection_reason: str
    retry_count: int
    max_retries: int
    status: str
