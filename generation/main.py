import json

from src.misc import gen_user_prompt, load_level_params
from src.prompts import SYSTEM_PROMPT
from src.schema import KATA_CLASS_SCHEMA, KATA_FUNCTION_SCHEMA

from openai import OpenAI

from src.validation import validate_kata


BASE_URL = "http://localhost:5000/v1"
API_KEY = "not-needed"

client = OpenAI(base_url=BASE_URL, api_key=API_KEY)

level = "kyu10"
user_prompt = gen_user_prompt(level)
kata_type = "function" if level in ("kyu10", "kyu9", "kyu8", "kyu7", "kyu6", "kyu5", "kyu4", "kyu3", "kyu2", "kyu1") else "class"
enable_thinking = kata_type == "class"

res = client.chat.completions.create(
    model="qwen3.8-27b-exl3-4.50bpw",
    messages=[{"role": "system", "content": SYSTEM_PROMPT}, {"role": "user", "content": user_prompt}],
    extra_body={"template_vars": {"enable_thinking": enable_thinking}},
    response_format={
        "type": "json_schema",
        "json_schema": {"name": f'kata_{kata_type}', "schema": KATA_FUNCTION_SCHEMA if kata_type == "function" else KATA_CLASS_SCHEMA}
    }
)

errors = validate_kata(res.choices[0].message.content, level_params=load_level_params(level)["params"])
print(errors)
