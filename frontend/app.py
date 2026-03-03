import streamlit as st
import requests

API_URL = "http://localhost:3000/todos"


def get_todos():
    try:
        resp = requests.get(API_URL, timeout=5)
        resp.raise_for_status()
        return resp.json()
    except requests.ConnectionError:
        st.error("Cannot connect to the backend API. Make sure it is running on port 3000.")
        return None
    except requests.RequestException as e:
        st.error(f"API error: {e}")
        return None


def create_todo(title):
    resp = requests.post(API_URL, json={"title": title}, timeout=5)
    resp.raise_for_status()
    return resp.json()


def update_todo(todo_id, **fields):
    resp = requests.put(f"{API_URL}/{todo_id}", json=fields, timeout=5)
    resp.raise_for_status()
    return resp.json()


def delete_todo(todo_id):
    resp = requests.delete(f"{API_URL}/{todo_id}", timeout=5)
    resp.raise_for_status()


# --- UI ---
st.set_page_config(page_title="Todo App", page_icon="✅", layout="centered")
st.title("Todo App")

# Add new todo
with st.form("add_todo", clear_on_submit=True):
    new_title = st.text_input("New todo")
    submitted = st.form_submit_button("Add")
    if submitted and new_title.strip():
        try:
            create_todo(new_title.strip())
            st.rerun()
        except requests.RequestException as e:
            st.error(f"Failed to create todo: {e}")

st.divider()

# List todos
todos = get_todos()
if todos is None:
    st.stop()

if len(todos) == 0:
    st.info("No todos yet. Add one above!")
else:
    for todo in todos:
        col1, col2, col3 = st.columns([0.5, 5, 1])

        with col1:
            checked = st.checkbox(
                "done",
                value=todo["completed"],
                key=f"check_{todo['id']}",
                label_visibility="collapsed",
            )
            if checked != todo["completed"]:
                try:
                    update_todo(todo["id"], completed=checked)
                    st.rerun()
                except requests.RequestException as e:
                    st.error(f"Update failed: {e}")

        with col2:
            if todo["completed"]:
                st.markdown(f"~~{todo['title']}~~")
            else:
                st.write(todo["title"])

        with col3:
            if st.button("Delete", key=f"del_{todo['id']}"):
                try:
                    delete_todo(todo["id"])
                    st.rerun()
                except requests.RequestException as e:
                    st.error(f"Delete failed: {e}")
