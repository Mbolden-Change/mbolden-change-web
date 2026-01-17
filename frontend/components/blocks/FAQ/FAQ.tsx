import React from 'react'
import data from './data';

type questionAnswer = {question: string, answer: string}

type FAQProps = {heading: string, questions : questionAnswer[]}

const FAQ = () => {
  return (<>
    <div>FAQ</div>
    <div>
{
    data.map((item)=> (<div>{item.question}</div>))
}
    </div>
  </>)
}

export default FAQ