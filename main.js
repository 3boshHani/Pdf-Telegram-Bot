const { Telegraf } = require("telegraf");
const fs = require("fs");
const js = require('jspdf');
const fetch = require("node-fetch");


const bot = new Telegraf("6920859772:AAHTusCGjxKHDgeCelYniKtYz7tJEqtknA8");

// if user typed /start
bot.start((ctx) => ctx.reply("ابعت اصور ي فنان 😂"));

// the random replays to any text
const randomReplays = [
    "م تبعت الصور ي جدع 🤨",
    "ارحمني و ابعت",
    "يعم ابعت الصور",
    "ابعت ي لطخ",
    "الصور بعد اذنك يسطااا",
    "خليك محترم و ابعت",
    "الي م هيبعت امه رقاصه",
];


function sendHourlyMessage() {
    const chatId = '6399562226';
    const message = 'إِنَّ اللَّهَ وَمَلائِكَتَهُ يُصَلُّونَ عَلَى النَّبِيِّ يَا أَيُّهَا الَّذِينَ آمَنُوا صَلُّوا عَلَيْهِ وَسَلِّمُوا تَسْلِيمًا';

    bot.telegram.sendMessage(chatId, message)
}
// Schedule sending message every hour
setInterval(sendHourlyMessage, 3000 * 1000);


// the array for photos
let photosArray = [];

bot.on("photo", async (ctx) => {
    try {
        // to return the largest size of the photo
        const largestPhoto = ctx.message.photo.reduce((prev, current) => {
            return (current.width > prev.width) ? current : prev;
        });

        // Get photo file path
        const filePath = await ctx.telegram.getFileLink(largestPhoto);

        // Push photo file path to photosArray
        photosArray.push(filePath);
        
        // Prompt user for PDF name once all photos are received
        ctx.reply("أكتب اسم ال PDF");
    } catch (error) {
        console.error(error);
        ctx.reply("معلشي , بس حصل مشكلة 😔");
    }
});

bot.on("text", async (ctx) => {
    // function to send random replays
    if (photosArray.length == 0) {
        const randomIndex = Math.floor(Math.random() * randomReplays.length);
        ctx.reply(randomReplays[randomIndex]);
        return;
    }
    // to take pdf name from user
    const pdfName = ctx.message.text.trim() + ".3BOSH.pdf";
    try {
        
        const doc = new js.jsPDF();

        // convert each photo in photosArray to base64 and add it to the PDF
        for (let i = 0; i < photosArray.length; i++) {
            console.log(photosArray);
            const filePath = photosArray[i];
            const photoStream = await fetch(filePath);
            const photoBuffer = await photoStream.buffer();
            const base64Image = photoBuffer.toString("base64");
            // to put every photo in single pdf page
            if (i > 0) {
                doc.addPage();
            }
            let pageWidth = 210; // Width of the page in mm
            let imageWidth = 200; // Width of the image in mm
            let margin = (pageWidth - imageWidth) / 2; // Calculate the margin for centering

            doc.addImage(base64Image, "JPEG", margin, 20, imageWidth, 230); // Center the image horizontally
            
        }
    
        // save the PDF
        doc.save(pdfName);  
        
        // reply with the PDF file
        const pdfFile = fs.readFileSync(pdfName);
        await ctx.replyWithDocument({ source: pdfFile, filename: pdfName });
        ctx.reply("دعوة حلوة منك بقا 💜");
        
        // clean the temporary pdf file
        fs.unlinkSync(pdfName);
        
        // clear the photosArray
        photosArray = [];

    } catch (error) {
            console.error(error);
            ctx.reply("حصل مشكلة أثناء إنشاء الـ PDF 😔");
        }
    });

// Start the bot
bot.launch();


