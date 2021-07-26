require('dotenv').config()
const express = require('express');
const session = require('express-session')
const MongoDBSession = require('connect-mongodb-session')(session)
const mongoose = require('mongoose')
const app = express();
app.use(express.json());
const port = process.env.PORT;
const { exec } = require('child_process');
const readline = require('readline');
var fs = require('fs');
const { readEachLine } = require('./helpers');
const mongodbUri = process.env.MONGO_URI


mongoose.connect(mongodbUri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true }).then(res => {
    console.log("mongodb is connected")
})

const store = new MongoDBSession({
    uri: mongodbUri,
    collection: 'mySessions'
});

app.use(session({
    secret: 'key that will sign cookie',
    resave: false,
    saveUninitialized: false,
    store: store
}))



function replaceCurrentProgram(body){
    fs.writeFileSync('currentProgram.txt', '', function (error) {
        if (error) {
            console.log(error);
        }
    });

    for (element of body) {
        fs.appendFileSync('currentProgram.txt', element + "\n", function (error) {
            if (error) {
                console.log(error);
            }
        });
    }
}

app.post('/login', (req, res) => {
    console.log('🚀 ~ app.post ~ req', req.body);
    if (req.body.username === 'test' && req.body.password === 'test') {
        res.send({ connected: true })
        req.session.isAuth = true
    } else {
        res.send({connected: false})
        req.session.isAuth = false
    }
})

app.post('/compile', (req, res) => {
    replaceCurrentProgram(req.body);
    try {
        // script.ps1 executes sbt commands and copy result files into nodejs working repository
        exec('./scripts/compile.ps1', { 'shell': 'powershell.exe' }, (error, stdout, stderr) => {
            if (stdout.includes("error")) {
                res.send("Errors occured while compiling " + stdout)
            } else {
                res.send("Compilation was successful " + stdout)
            }
        })
    } catch (error) {
        console.log("ERREUR:")
        console.log(error)
    }
})

app.post('/get_hex', (req, res) => {
    var responseArray = []

    fs.writeFileSync('currentProgram.txt', '', function (error) {
        if (error) {
            console.log(error);
        }
    });

    for (element of req.body) {
        fs.appendFileSync('currentProgram.txt', element + "\n", function (error) {
            if (error) {
                console.log(error);
            }
        });
    }

    try {
        // script.ps1 executes sbt commands and copy result files into nodejs working repository
        exec('./scripts/get_hex.ps1', { 'shell': 'powershell.exe' }, (error, stdout, stderr) => {
            if (stdout.includes("error")) {
                console.log("ERREUR")
            } else {
                console.log("SUCCES")   
                try {
                    responseArray = fs.readFileSync('output_files/hex_program.txt', 'utf8').toString().split("\n");
                } catch (e) {
                    console.log('Error:', e.stack);
                }
            }
            res.send(responseArray)
        })
    } catch (error) {
        console.log("ERREUR:")
        console.log(error)
    }
});

// ID du processeur pour la compilation à ajouter
app.post('/run_simulation', (req, res) => {

    console.log(req.body)

    fs.writeFileSync('currentProgram.txt', '', function(error){
        if(error){
            console.log(error);
        }
    });

    for(element of req.body){
        fs.appendFileSync('currentProgram.txt', element + "\n", function(error){
            if(error){
                console.log(error);
            }
        });
    }

    var responseArray = []

    try {
        // script.ps1 executes sbt commands and copy result files into nodejs working repository
        exec('./scripts/run_simulation.ps1', { 'shell': 'powershell.exe' },async (error, stdout, stderr) => {
            if (stdout.includes("error")) {
                console.log('🚀 ~ exec ~ stderr', stderr);
                console.log('🚀 ~ exec ~ error', error);
                console.log("ERREUR")
            } else {
                console.log("SUCCES")
                try {
                    const acc = await readEachLine('output_files/acc_status.txt');
                    const memory = await readEachLine('output_files/internal_memory_status.txt');
                    const ir = await readEachLine('output_files/ir_status.txt');
                    pc = await readEachLine('output_files/pc_status.txt');
                    state = await readEachLine('output_files/state_status.txt');

                    for (let i in acc) {
                        responseArray.push(
                            {
                                "ir_status": ir[i],
                                "pc_status": pc[i],
                                "memory": memory[i].split(","),
                                "state_status": state[i],
                                "acc_status": acc[i],
                                "step": i
                            })
                        }
                } catch (e) {
                    console.log('Error:', e.stack);
                }
            }
            res.send(responseArray)
        })
    } catch (error) {
        console.log(error)
        res.send("ERREUR")
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}!`)
});