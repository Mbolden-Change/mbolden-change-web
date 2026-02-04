import ReusableAccordian from './ReusableAccordain';
import data from './data';
import styles from './FAQ.module.css';
import Grid from '@/components/Grid';
import GridItem from '@/components/GridItem';
function FAQ() {
  return (
    <div>
      <Grid>
        <GridItem desktopSpan ={12} mobileSpan={12} >
      <h1 className={styles.heading}>Frequently Asked Questions</h1>  
       </GridItem>
       <GridItem desktopSpan ={12} mobileSpan={12} >
        <ReusableAccordian items={data} />
       </GridItem>
      
     </Grid>
    </div>
  );
}

export default FAQ;


// import React from 'react'
// import data from './data';

// type questionAnswer = {question: string, answer: string}

// type FAQProps = {heading: string, questions : questionAnswer[]}

// const FAQ = () => {
//   return (<>
//     <div>FAQ</div>
//     <div>
// {
//     data.map((item)=> (<div>{item.question}</div>))
// }
//     </div>
//   </>)
// }

// export default FAQ


// interface ButtonProps {
//   message: string;
//   count?: number; // Optional prop
// }


// const Button: React.FC<ButtonProps> = ({ message, count }) => {
//   return (
//     <div>
//       <p>Message: {message}</p>
//       {count && <p>Count: {count}</p>}
//     </div>
//   );
// };