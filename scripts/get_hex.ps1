Copy-Item -Path "D:\work\Backend\Backend_nodeJS\currentProgram.txt" -Destination "D:\work\Backend\chisel-cm\programs"
Set-Location -Path "D:\work\Backend\chisel-cm"
sbt "test:runMain accProcNoJumpHexCode"
Copy-Item -Path "D:\work\Backend\chisel-cm\output_files\hex_program.txt" -Destination "D:\work\Backend\Backend_nodeJS\output_files"