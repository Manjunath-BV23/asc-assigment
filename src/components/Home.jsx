import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import "./Home.css"

const TaskBoard = () => {
    const [userid, setUserid] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [lists, setLists] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchLists();
    fetchTasks();
  }, []);

  const fetchLists = async () => {
    try {
      const response = await axios.get('https://taskboard-api.onrender.com/lists');
      setLists(response.data);
    } catch (error) {
      console.error('Error fetching lists:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await axios.get('https://taskboard-api.onrender.com/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post('https://taskboard-api.onrender.com/login', { userid, password });
      if (response.data.success) {
        setUser(userid);
        alert("Loggedin")
      } else {
        console.log(response.data.message);
      }
      setUser(userid);
    } catch (error) {
      console.log('An error occurred.');
      alert("Error")

    }
  };

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    try {
      const updatedTask = {
        ...tasks.find((task) => task.id === draggableId),
        listId: destination.droppableId,
      };
      await axios.put(`/api/tasks/${draggableId}`, updatedTask);
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  return (
    <>
        {user == null ?(<div>
            <h1>User Login</h1>
        <input type="text" placeholder="Username" value={userid} onChange={(e) => setUserid(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button onClick={handleLogin}>Login</button>
        </div>) :
        
        <div className="task-board">
        <h1>Task Board</h1>
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className="lists-container" style={{ display: 'flex', overflowX: 'auto' }}>
            {lists.map((list) => (
                <div key={list.id} className="list" style={{ border: '1px solid black', padding: '10px', margin: '10px' }}>
                <h2>{list.name}</h2>
                <Droppable droppableId={list.id}>
                    {(provided) => (
                    <div
                        className="task-list"
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                    >
                        {tasks
                        .filter((task) => task.listId === list.id)
                        .map((task, index) => (
                            <Draggable
                            key={task.id}
                            draggableId={task.id}
                            index={index}
                            >
                            {(provided) => (
                                <div
                                className={`task ${
                                    task.completed ? 'completed' : ''
                                }`}
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                >
                                {task.name}
                                </div>
                            )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </div>
                    )}
                </Droppable>
                </div>
            ))}
            </div>
        </DragDropContext>
        </div>}
    </>
  );
};

export default TaskBoard;
