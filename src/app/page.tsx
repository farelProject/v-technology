
import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { VTechIcon } from '@/components/vtech-icon';
import { ArrowRight, Bot, Image as ImageIcon, Search } from 'lucide-react';
import Link from 'next/link';

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="bg-card p-6 rounded-lg shadow-sm text-center">
            <div className="mb-4 inline-block bg-primary/10 p-3 rounded-full">
                {icon}
            </div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
        </div>
    )
}


export default function HomePage() {
  return (
    <AppShell>
        {/* Hero Section */}
        <section className="text-center py-20 px-4 bg-background">
            <div className="container mx-auto max-w-4xl">
                <VTechIcon className="mx-auto h-16 w-16 text-primary mb-4" />
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                    Welcome to VTech AI Assistant
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground mb-8">
                    Your smart, versatile, and intuitive AI partner. Explore the future of artificial intelligence with powerful features designed for everyone.
                </p>
                <Button asChild size="lg">
                    <Link href="/chat">
                        Start Chatting <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </Button>
            </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
            <div className="container mx-auto max-w-5xl">
                <h2 className="text-3xl font-bold text-center mb-12">Features at a Glance</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    <FeatureCard 
                        icon={<Bot className="h-8 w-8 text-primary" />}
                        title="Intelligent Chat"
                        description="Engage in natural conversations, get answers, generate code, write essays, and get help with a wide range of tasks."
                    />
                    <FeatureCard 
                        icon={<ImageIcon className="h-8 w-8 text-primary" />}
                        title="Image Generation"
                        description="Bring your ideas to life. Create stunning and unique images from simple text descriptions in seconds."
                    />
                    <FeatureCard 
                        icon={<Search className="h-8 w-8 text-primary" />}
                        title="Web Search"
                        description="Get the most up-to-date information. VTech can search the web to answer questions about recent events and topics."
                    />
                </div>
            </div>
        </section>
        
        {/* Call to Action Section */}
        <section className="bg-primary/10 py-20 px-4">
            <div className="container mx-auto text-center max-w-2xl">
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
                <p className="text-muted-foreground mb-8">
                    Create an account to save your chat history and unlock a higher daily limit, or start chatting right away as a guest.
                </p>
                 <Button asChild size="lg">
                    <Link href="/chat">
                        Chat with VTech AI
                    </Link>
                </Button>
            </div>
        </section>
    </AppShell>
  );
}

