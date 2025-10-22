"use server";

import * as React from 'react'

export const greet = async () => Promise.resolve(1)

export const action = async (a: string, b: any) => {
  console.log({ a, b, c: process.env })
}

export const FromServer = async () => {
  const x = await greet()
  return <div>From server {x} </div>
}
