#!/bin/sh

npm i
cd client/ && npm i
cd ..
cd server && npm i
cd ..
npm run dev
