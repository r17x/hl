'use client'

import React from 'react'
import type { Message, Role } from './schema';
import { generateRecord } from './action';
import Markdown from 'react-markdown'

export function Chat() {
  const [messages, setMessages] = React.useState<Message[]>([])
  const patientRef = React.useRef<HTMLInputElement>(null);
  const doctorRef = React.useRef<HTMLInputElement>(null);
  const [state, submitAction, isPending] = React.useActionState(() => generateRecord(messages), {
    errors: null,
    generatedMessage: "",
    messages: []
  });

  function addMessage(role: Role) {
    let text = ""

    if (role === 'doctor') {
      text = doctorRef.current?.value ?? text
    }
    if (role === 'patient') {
      text = patientRef.current?.value ?? text
    }

    if (text.length > 0) {
      setMessages(prev =>
        [
          ...prev,
          { role, content: text }
        ]
      )
      if (role === 'doctor' && doctorRef.current) {
        doctorRef.current.value = ""
      }
      if (role === 'patient' && patientRef.current) {
        patientRef.current.value = ""
        doctorRef.current?.focus()
      }
    }
  }

  const result = (() => {
    if (isPending) {
      return <p>Generating based on the conversation...</p>
    }
    if (state.errors) {
      return <p>Something wrong while generating the conversation</p>
    }
    if (state.generatedMessage.length > 0) {
      return <div box-="square"><Markdown>{state.generatedMessage}</Markdown></div>
    }
    return <p>Medical record here...</p>
  })()

  return (
    <div>
      <div is-="view">
        <div is-="view-content" className="row">
          <div className="left">
            {messages.length == 0 ? "Start conversation here..."
              : (<div box-="square">{messages.map((m, i) => <p key={`${i}-${m.role}`} role-={m.role}>{m.content}</p>)}</div>)}
            {result}
          </div>
          <div is-="view" className='right'>
            <div is-="view-content">

              <div>
                <div className="header">
                  <span is-="badge" variant-="foreground0">Doctor</span>
                </div>
                <div id="content">

                  <div id="buttons">
                    <input
                      ref={doctorRef}
                      size-="large"
                      placeholder="type for doctor"
                      onKeyDown={e => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addMessage('doctor')
                        }
                      }}
                    />
                    <button size-="large"
                      variant-="background2"
                      onClick={() => addMessage('doctor')}
                      disabled={isPending}
                    >Send</button>
                  </div>
                </div>
              </div>
              <div>
                <div className="header">
                  <span is-="badge" variant-="foreground0">Patient</span>
                </div>
                <div id="content">
                  <div id="buttons">
                    <input ref={patientRef} size-="large" placeholder="type for patient"
                      onKeyDown={e => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addMessage('patient')
                        }
                      }}
                    />
                    <button
                      size-="large"
                      variant-="background2"
                      onClick={() => addMessage('patient')}
                      disabled={isPending}
                    >Send</button>
                  </div>
                </div>
              </div>

              <form action={submitAction}>
                <button type='submit' size-="large" variant-="background4" disabled={messages.length === 0 || isPending} >Generate Medical Record</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div >
  )
}
