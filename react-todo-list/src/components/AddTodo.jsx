import React from "react"
import { observer } from "mobx-react"
import { todosStore } from "../stores"

@observer
export class AddTodo extends React.Component {
    render() {
        return (
            <form onSubmit={e => this.submit(e)}>
                <input type="text" 
                ref={node => this.input = node} />
                <button type="submit">添加</button>
            </form>
        )
    }

    submit(e) {
        e.preventDefault()
        if (!this.input.value) return
        todosStore.add(this.input.value)
        this.input.value = ""
    }
}