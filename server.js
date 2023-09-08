import express from 'express';
import { ObjectId } from 'mongodb';
import { MongoClient } from 'mongodb';

const client = new MongoClient('mongodb://localhost:27017')
await client.connect();
const db = client.db('jijutsuClub');
const memberCollection = db.collection('members');

const port = 3000;
const app = express();


app.set('views', './views');
app.set('view engine', 'ejs');

app.use(express.urlencoded());
app.use(express.static("static"))

app.get('/members', async (req,res) => {
    const members = await db.collection('test').find({}).toArray();
    res.render('members', { members });
});
app.get('/sort', async (req,res) => { 
    if (req.url === '/sort?filter=%C3%96-A') {
        const members = await db.collection('test').find({}).sort({name: -1}).toArray();   
        res.render('members', { members });
    } else if (req.url === '/sort?filter=Default') {
        const members = await db.collection('test').find({}).toArray();
        res.render('members', { members });
    } else {      
        const members = await db.collection('test').find({}).sort({name: 1}).toArray(); 
        res.render('members', { members });
    }
    console.log(req.url)
});
app.get('/api/members', async (req,res) => {
    const members = await db.collection('test').find({}).toArray();
    res.json(members);
});

app.get('/member/:id', async (req,res) => {
    console.log(req.params)
    const member = await db.collection('test').findOne({ _id: new ObjectId(req.params.id) });
    let date
    if (typeof member.memberSince === 'string') {
        date = new Date(member.memberSince)
    } else {
        date = member.memberSince
    }
    res.render('member', {
        id: member._id,
        name: member.name,
        email: member.email,
        phoneNumber: member.phoneNumber,
        memberSince: date.toISOString().substring(0,10),
        belt: member.belt,
    });

});
app.get('/member/d/:id', async (req,res) => {
    console.log(req.params)
    await db.collection('test').deleteOne({ _id: new ObjectId(req.params.id)});
    res.redirect('/members');
})

app.get('/members/create', (req,res) => {
    res.render('create');
})

app.post('/members/create', async (req,res) => {
    await db.collection('test').insertOne(req.body);
    res.redirect('/members');
})

app.post('/member/:id', async (req,res) => {
    console.log(req.body)
    await db.collection('test').updateOne({ _id: new ObjectId(req.params.id)}, {$set: 
        {
            name: req.body.name,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
            memberSince: req.body.memberSince,
            belt: req.body.belt
        }})
    res.redirect('/members')
})

app.get('/index', (req,res) => {
    res.render('index');
})

app.listen(port, () => console.log(`Listening on ${port}`))