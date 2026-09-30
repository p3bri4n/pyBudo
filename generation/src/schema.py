KATA_FUNCTION_SCHEMA = {
    "type": "object",
    "properties": {
        "kata_type": {"type": "string", "enum": ["function"]},
        "title": {"type": "string"},
        "statement": {"type": "string"},
        "signature": {"type": "string"},
        "solution_reference": {"type": "string"},
        "tests": {
            "type": "array",
            "minItems": 3,
            "items": {
                "type": "object",
                "properties": {
                    "input": {"type": "array"},
                    "output": {}
                },
                "required": ["input", "output"],
                "additionalProperties": False
            }
        },
        "concepts_used": {
            "type": "array",
            "items": {"type": "string"}
        }
    },
    "required": [
        "kata_type", "title", "statement", "signature",
        "solution_reference", "tests", "concepts_used"
    ],
    "additionalProperties": False
}

KATA_CLASS_SCHEMA = {
    "type": "object",
    "properties": {
        "kata_type": {"type": "string", "enum": ["class"]},
        "title": {"type": "string"},
        "statement": {"type": "string"},
        "class_name": {"type": "string"},
        "signature": {"type": "string"},
        "solution_reference": {"type": "string"},
        "tests": {
            "type": "array",
            "minItems": 3,
            "items": {
                "type": "object",
                "properties": {
                    "init": {"type": "array"},
                    "calls": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "method": {"type": "string"},
                                "args": {"type": "array"},
                                "expected_return": {}
                            },
                            "required": ["method", "args", "expected_return"],
                            "additionalProperties": False
                        }
                    },
                    "expected_state": {
                        "type": "object",
                        "additionalProperties": True
                    }
                },
                "required": ["init", "calls", "expected_state"],
                "additionalProperties": False
            }
        },
        "concepts_used": {
            "type": "array",
            "items": {"type": "string"}
        }
    },
    "required": [
        "kata_type", "title", "statement", "class_name", "signature",
        "solution_reference", "tests", "concepts_used"
    ],
    "additionalProperties": False
}
