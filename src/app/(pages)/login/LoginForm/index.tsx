'use client'

import React, { useCallback, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

import { Button } from '../../../_components/Button'
import { Input } from '../../../_components/Input'
import { Message } from '../../../_components/Message'
import { useAuth } from '../../../_providers/Auth'

import classes from './index.module.scss'

type FormData = {
  email: string
  password: string
  mfaCode?: string //?:campo opz
}

const LoginForm: React.FC = () => {
  const searchParams = useSearchParams()
  const allParams = searchParams.toString() ? `?${searchParams.toString()}` : ''
  const redirect = useRef(searchParams.get('redirect'))
  const { login } = useAuth()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [showMfaInput, setShowMfaInput] = useState(false) //controllare quando mostra mfa
  const [generatedMfaCode, setGeneratedMfaCode] = useState<string | null>(null) //salva mfc

  const {
    register,
    handleSubmit,
    formState: { errors, isLoading },
  } = useForm<FormData>()

  const onSubmit = useCallback(
    async (data: FormData) => {
      try {
        if (!showMfaInput) {
          await login(data)

          const mfaCode = Math.floor(100000 + Math.random() * 900000).toString()
          setGeneratedMfaCode(mfaCode)
          console.log('Codice MFA generato:', mfaCode)
          setShowMfaInput(true)
        } else {
          if (data.mfaCode === generatedMfaCode) {
            if (redirect?.current) router.push(redirect.current as string)
            else router.push('/account')
          } else {
            setError('Codice MFA errato. Riprova.')
          }
        }
      } catch (_) {
        setError('Errore nelle credenziali fornite. Riprova.')
      }
    },
    [login, router, generatedMfaCode, showMfaInput, redirect],
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={classes.form}>
      <p>
        {`This is where your users will login to manage their account, view their comment history, and more. To manage all users, `}
        <Link href="/admin/collections/users">login to the admin dashboard</Link>
        {'.'}
      </p>
      <Message error={error} className={classes.message} />

      {!showMfaInput ? (
        <>
          <Input
            name="email"
            label="Email Address"
            required
            register={register}
            error={errors.email}
            type="email"
          />
          <Input
            name="password"
            type="password"
            label="Password"
            required
            register={register}
            error={errors.password}
          />
        </>
      ) : (
        <>
          <Input
            name="mfaCode"
            type="text"
            label="Inserisci il codice MFA"
            required
            register={register}
            error={errors.mfaCode}
          />
        </>
      )}

      <Button
        type="submit"
        appearance="primary"
        label={isLoading ? 'Processing' : showMfaInput ? 'Verifica MFA' : 'Login'}
        disabled={isLoading}
        className={classes.submit}
      />

      <div>
        <Link href={`/create-account${allParams}`}>Create an account</Link>
        <br />
        <Link href={`/recover-password${allParams}`}>Recover your password</Link>
      </div>
    </form>
  )
}

export default LoginForm
