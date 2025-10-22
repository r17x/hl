import * as React from 'react';
import { action } from './actions';

type Role = 'patient' | 'doctor';

type Message = {
  role: Role;
  text: string;
}

export const App = () => {
  const [stateAction, submitAction, isPending] = React.useActionState(action, "", '/')

  console.log({ stateAction, submitAction, isPending })

  const [state, setState] = React.useState<Message[]>([])
  const patientRef = React.useRef<HTMLInputElement>(null);
  const doctorRef = React.useRef<HTMLInputElement>(null);
  const generateRef = React.useRef<HTMLButtonElement>(null);

  function addMessage(role: Role) {
    let text = ""

    if (role === 'doctor') {
      text = doctorRef.current?.value ?? text
    }
    if (role === 'patient') {
      text = patientRef.current?.value ?? text
    }

    if (text.length > 0) {
      setState(prev => [
        ...prev,
        { role, text }
      ])
      if (role === 'doctor' && doctorRef.current) {
        doctorRef.current.value = ""
      }
      if (role === 'patient' && patientRef.current) {
        patientRef.current.value = ""
        doctorRef.current?.focus()
      }
    }
  }

  return (
    <div>
      <h1> Health Application with AI </h1>

      <div is-="view">
        <div is-="view-content" className="row">
          <div className="left">
            {state.length == 0 ? "Conversation here..."
              : state.map((m, i) => <p key={`${i}-${m.role}`} role-={m.role}>{m.text}</p>)}
          </div>
          <div is-="view" className='right'>
            <div is-="view-content">
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
                    > Send</button>
                  </div>
                </div>
              </div>

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
                        console.log({ e })
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addMessage('doctor')
                        }
                      }}
                    />
                    <button size-="large"
                      variant-="background2"
                      onClick={() => addMessage('doctor')}

                    >Send</button>
                  </div>
                </div>
              </div>

              <form action={submitAction}>
                <button ref={generateRef}
                  type='submit'
                  size-="large" variant-="background4" disabled={state.length === 0}>Generate Medical Record</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div >
  )
}
