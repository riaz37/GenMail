'use client'
import { useChat } from 'ai/react'
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button'
import { AnimatePresence } from 'framer-motion';
import React from 'react'
import { Send } from 'lucide-react';
import { useLocalStorage } from 'usehooks-ts';
import { cn } from '@/lib/utils';
import { SparklesIcon } from '@heroicons/react/24/solid';
import StripeButton from './stripe-button';
import PremiumBanner from './premium-banner';
import { toast } from 'sonner';


const transitionDebug = {
    type: "easeOut",
    duration: 0.2,
};
const AskAI = ({ isCollapsed }: { isCollapsed: boolean }) => {
    const [accountId] = useLocalStorage('accountId', '')
    const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
        api: "/api/chat",
        body: {
            accountId,
        },
        onError: (error) => {
            if (error.message.includes('Limit reached')) {
                toast.error('You have reached the limit for today. Please upgrade to pro to ask as many questions as you want')
            } else {
                toast.error('An error occurred. Please try again.')
            }
        },
        onFinish: () => {
            // Optional: Handle successful completion
            console.log('Chat completed successfully');
        },
    });

    React.useEffect(() => {
        const messageContainer = document.getElementById("message-container");
        if (messageContainer) {
            messageContainer.scrollTo({
                top: messageContainer.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [messages]);

    if (isCollapsed) return null;

    return (
        <div className='p-4 mb-14'>
            <PremiumBanner />
            <div className="h-4"></div>
            <motion.div className="flex flex-1 flex-col items-end justify-end pb-4 border p-4 rounded-lg bg-gray-100 shadow-inner dark:bg-gray-900">
                <div className="max-h-[50vh] overflow-y-scroll w-full flex flex-col gap-2" id='message-container'>
                    <AnimatePresence mode="wait">
                        {messages.map((message) => (
                            <motion.div
                                key={message.id}
                                layout="position"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className={cn("z-10 mt-2 max-w-[250px] break-words rounded-2xl p-4", {
                                    'self-end bg-blue-500 text-white': message.role === 'user',
                                    'self-start bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100': message.role === 'assistant',
                                })}
                            >
                                {message.content}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                <form onSubmit={handleSubmit} className="flex w-full items-end gap-2 mt-4">
                    <input
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={input}
                        placeholder="Ask AI anything..."
                        onChange={handleInputChange}
                    />
                    <Button 
                        type="submit" 
                        disabled={isLoading || !input.trim()}
                        className="h-10 px-4"
                    >
                        {isLoading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </form>
            </motion.div>
        </div>
    );
}

export default AskAI
