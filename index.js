const express = require('express');
const app = express();
app.use(express.json());
const port = 8000;
const { exec } = require('child_process');

var fs = require('fs');

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
        exec('./scripts/run_simulation.ps1', { 'shell': 'powershell.exe' }, (error, stdout, stderr) => {
            if (stdout.includes("error")) {
                console.log("ERREUR")
            } else {
                console.log("SUCCES")
                try {
                    responseArray[0] = fs.readFileSync('output_files/acc_status.txt', 'utf8').toString().split("\n");
                    responseArray[1] = fs.readFileSync('output_files/internal_memory_status.txt', 'utf8').toString().split("\n");
                    responseArray[2] = fs.readFileSync('output_files/ir_status.txt', 'utf8').toString().split("\n");
                    responseArray[3] = fs.readFileSync('output_files/pc_status.txt', 'utf8').toString().split("\n");
                    responseArray[4] = fs.readFileSync('output_files/state_status.txt', 'utf8').toString().split("\n");
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