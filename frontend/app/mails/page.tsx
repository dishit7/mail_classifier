 import React from 'react'
 import MailsPage from './components/mails'
interface Mails{
    subject:string,
    body:string,
    category:string
}
const page = async () => { 
  return (
    <div>
      
     <MailsPage />
      
    </div>
  )
}

export default page
