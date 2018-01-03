import React from "react"
import { observer } from "mobx-react"
import { todosStore } from "../stores"

@observer
export class ShowTodos extends React.Component {
    render() {
        return (
            <ul>
                {
                    todosStore.list.map(todo => (
                        <li style={this.isCompleted(todo.completed)}
                            key={todo.id}
                            onClick={() => this.clickHandle(todo)}>
                            {todo.text}
                        </li>
                    ))
                }
            </ul>
        )
    }

    clickHandle(todo) {
        todo.completed = !todo.completed
    }

    isCompleted(completed) {
        if (completed) {
            return { textDecoration: "line-through" }
        } else {
            return { textDecoration: "none" }
        }
    }
}