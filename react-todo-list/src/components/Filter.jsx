import React from "react"
import { observer } from "mobx-react"
import { todosStore, filters } from "../stores"

@observer
export class Filter extends React.Component {
    render() {
        return (
            <p className="filter">
                Filter:
                {
                    filters.map(filter => (
                        <span key={filter}
                            style={this.isChecked(filter)}
                            onClick={() => this.clickHandle(filter)}>{filter}
                        </span>
                    ))
                }
            </p>
        )
    }

    clickHandle(filter) {
        todosStore.filter = filter
    }

    isChecked(key) {
        if (todosStore.filter === key) {
            return { color: "blue", textDecoration: "none" }
        }
    }
}