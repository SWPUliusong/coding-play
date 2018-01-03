import { observable, computed, action } from "mobx"

let originId = 0
class Todo {
    id = originId++
    @observable completed = false

    constructor(text) {
        this.text = text
    }
}

const filterWays = {
    ALL(todos) {
        return todos.filter(todo => true)
    },
    ACTIVE(todos) {
        return todos.filter(todo => !todo.completed)
    },
    COMPLETED(todos) {
        return todos.filter(todo => todo.completed)
    }
}

export const filters = Object.keys(filterWays)

export class TodosStore {
    @observable todos = []
    @observable filter = filters[0]
    
    @action add(text) {
        this.todos.push(new Todo(text))
    }

    @computed get list() {
        const filterWay = filterWays[this.filter]

        if (!filterWay) return this.todos

        return filterWay(this.todos)
    }
}

export const todosStore = new TodosStore()