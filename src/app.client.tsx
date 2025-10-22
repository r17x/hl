"use client";
import * as React from 'react'
import { hydrateRoot } from 'react-dom/client';
import { App } from './app'
import '@webtui/css'

const root = document.getElementById('root')

if (root) hydrateRoot(root, <App />)


