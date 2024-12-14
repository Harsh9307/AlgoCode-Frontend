import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Import Link for navigation
import './QuestionsList.css'

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
    <div className="container">
      <h2 className="header">Questions List</h2>
      <ul className="questions-list">
        {questions.map((question) => (
          <li key={question._id} className="question-item">
            <Link to={`/problems/${question._id}`} className="question-link">
              {question.title}
            </Link>
            <span className={`difficulty ${question.difficulty.toLowerCase()}`}>
              {question.difficulty}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QuestionsList;
