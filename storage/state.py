"""
In-memory state storage.
This will be replaced with database in Step 3.2.
"""

# In-memory conversation history storage (per chat_id)
conversation_history = {}

# In-memory order storage
orders = {}

# Order counter (dict for reference passing)
order_counter = {'value': 0}
