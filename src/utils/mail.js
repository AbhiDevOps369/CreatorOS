import Mailgen from "mailgen";
import nodemailer from "nodemailer";
const sendEmail=async (options)=>{
    const mailGenerator=new Mailgen({   
        theme:"default",
        product:{
            name:"Creator OS",
            link:"https://CreatorOS.com"
        }
    })
    const emailTextual=mailGenerator.generatePlaintext(options.mailgenContent);
    const emailHtml=mailGenerator.generate(options.mailgenContent);
    
    console.log({
    host: process.env.MAIL_TRAP_SMTP_HOST,
    port: process.env.MAIL_TRAP_SMTP_PORT,
    user: process.env.MAIL_TRAP_SMTP_USER,
    pass: process.env.MAIL_TRAP_SMTP_PASS ? "exists" : "missing"
});
    const transporter=nodemailer.createTransport({
        host:process.env.MAIL_TRAP_SMTP_HOST,
        port:process.env.MAIL_TRAP_SMTP_PORT,
        auth:{
            user:process.env.MAIL_TRAP_SMTP_USER,
            pass:process.env.MAIL_TRAP_SMTP_PASS,
        }
    })
    const mail={
        from: "mail.taskmanager@example.com",
        to:options.email,
        subject:options.subject,
        text:emailTextual,
        html:emailHtml
    }
    try {
        const info = await transporter.sendMail(mail)
        console.log("Email sent:", info.messageId)
    } catch (error) {
        console.error("Email service failed:", error)
    }
};
const emailVerificationMailgenContent=(username,verificationUrl)=>{
    return {
        body:{
            name:username,
            intro:"Welcome to our App ! we are excited to have you on board ",
            action:{
                instruction:"To verify your email,click on the following button",
                button:{
                    color:"#22BC66",
                    text:"Verify your Email",
                    link:verificationUrl
                },
            },
            outro:"Need help? Reply to this Email",
        },
    };
};
const forgotPasswordMailgenContent=(username,resetUrl)=>{
    return {
        body:{
            name:username,
            intro:"We got a requets to reset your password ",
            action:{
                instruction:"To Reset your password please click on the button",
                button:{
                    color:"#047d39",
                    text:"Reset your password",
                    link:resetUrl
                },
            },
            outro:"Didn't sent a request? Report here by replying to this mail",
        },
    };
};
export {
    emailVerificationMailgenContent,
    forgotPasswordMailgenContent,
    sendEmail
}