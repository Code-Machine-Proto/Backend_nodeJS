# Backend_nodeJS

## Configuration
to develop locally create a file named `local.json` with this content:

{
  "mongoURI": local mongo url,
  "jwtSecret": a random token,
  "jwtExpiration": number of second,
  "port": port ,
  "salt_round": random number
}