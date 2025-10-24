'use client'

import { useEffect, useRef, useState } from 'react'

interface WebSocketMessage {
    type: 'notification' | 'order_update' | 'user_registration' | 'low_stock' | 'system_health' | 'bulk_action'
    data: any
    timestamp: string
}

interface UseWebSocketOptions {
    url: string
    onMessage?: (message: WebSocketMessage) => void
    onError?: (error: Event) => void
    onOpen?: () => void
    onClose?: () => void
    reconnectInterval?: number
    maxReconnectAttempts?: number
}

export function useWebSocket({
    url,
    onMessage,
    onError,
    onOpen,
    onClose,
    reconnectInterval = 5000,
    maxReconnectAttempts = 5
}: UseWebSocketOptions) {
    const [isConnected, setIsConnected] = useState(false)
    const [reconnectAttempts, setReconnectAttempts] = useState(0)
    const ws = useRef<WebSocket | null>(null)
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const shouldReconnect = useRef(true)

    const connect = () => {
        try {
            // Check if WebSocket is supported and URL is valid
            if (typeof WebSocket === 'undefined' || !url || !/^wss?:\/\//.test(url)) {
                console.warn('WebSocket not supported in this environment')
                return
            }

            ws.current = new WebSocket(url)

            ws.current.onopen = () => {
                setIsConnected(true)
                setReconnectAttempts(0)
                onOpen?.()
            }

            ws.current.onmessage = (event) => {
                try {
                    const message: WebSocketMessage = JSON.parse(event.data)
                    onMessage?.(message)
                } catch (error) {
                    console.error('Failed to parse WebSocket message:', error)
                }
            }

            ws.current.onclose = () => {
                setIsConnected(false)
                onClose?.()

                // Attempt to reconnect if we haven't exceeded max attempts
                if (shouldReconnect.current && reconnectAttempts < maxReconnectAttempts) {
                    reconnectTimeoutRef.current = setTimeout(() => {
                        setReconnectAttempts(prev => prev + 1)
                        connect()
                    }, reconnectInterval)
                }
            }

            ws.current.onerror = (error) => {
                console.warn('WebSocket connection failed, disabling reconnection:', error)
                shouldReconnect.current = false
                // Surface error to caller if needed without throwing
                onError?.(error)
            }
        } catch (error) {
            console.warn('Failed to create WebSocket connection, using mock mode:', error)
        }
    }

    const disconnect = () => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
        }
        shouldReconnect.current = false
        if (ws.current) {
            ws.current.close()
            ws.current = null
        }
        setIsConnected(false)
    }

    const sendMessage = (message: any) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(message))
        }
    }

    useEffect(() => {
        shouldReconnect.current = true
        connect()

        return () => {
            disconnect()
        }
    }, [url])

    return {
        isConnected,
        sendMessage,
        disconnect,
        reconnectAttempts
    }
}
