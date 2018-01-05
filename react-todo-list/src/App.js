import React, { Component } from 'react'
import { AddTodo } from "./components/AddTodo"
import { ShowTodos } from "./components/ShowTodos"
import { Filter } from "./components/Filter"

import './App.css';

class App extends Component {
  render() {
    return (
      <div>
        <AddTodo />
        <ShowTodos />
        <Filter />
      </div>
    );
  }
}

export default App;
