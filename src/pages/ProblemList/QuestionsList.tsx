import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Import Link for navigation

// Define the type of each question
interface Question {
  _id: string;
  title: string;
  difficulty: string;
}

const QuestionsList = () => {
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    axios.get('http://localhost:3000/api/v1/problems')
      .then(response => {
        setQuestions(response.data.data);
        console.log(response);
      })
      .catch(error => {
        console.error('There was an error fetching the questions!', error);
      });
  }, []);

  return (
    <div>
      <h2>Questions List</h2>
      <ul>
        {questions.map((question) => (
          <li key={question._id}>
            <Link to={`/problems/${question._id}`}>
              {question.title}
            </Link> 
            - Difficulty: {question.difficulty}
          </li>   
        ))}
      </ul>
    </div>
  );
};

export default QuestionsList;
