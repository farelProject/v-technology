
import { AppShell } from '@/components/app-shell';
import { Button } from '@/components/ui/button';
import { VTechIcon } from '@/components/vtech-icon';
import { ArrowRight, Bot, Code, GraduationCap, Image as ImageIcon, Lightbulb, Search, ShoppingCart, Sparkles, CheckCircle, PencilRuler, Briefcase } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';


function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="bg-card p-6 rounded-lg shadow-sm text-center border">
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
        <section className="py-20 px-4 bg-secondary/50">
            <div className="container mx-auto max-w-5xl">
                <h2 className="text-3xl font-bold text-center mb-2">Features at a Glance</h2>
                <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
                    VTech AI combines multiple powerful capabilities into one seamless experience.
                </p>
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
        
         {/* Why Choose VTech Section */}
        <section className="py-20 px-4">
            <div className="container mx-auto max-w-5xl grid md:grid-cols-2 gap-12 items-center">
                <div className="rounded-lg overflow-hidden shadow-lg">
                    <Image 
                        src="https://placehold.co/600x400.png"
                        alt="AI assistant interacting with user"
                        width={600}
                        height={400}
                        className="w-full h-full object-cover"
                        data-ai-hint="abstract technology"
                    />
                </div>
                <div>
                    <h2 className="text-3xl font-bold mb-4">Why Choose VTech AI?</h2>
                    <p className="text-muted-foreground mb-6">
                        Go beyond simple answers. VTech is designed to be a comprehensive tool that adapts to your needs, whether you're a student, professional, or creative.
                    </p>
                    <ul className="space-y-4">
                        <li className="flex items-start">
                            <CheckCircle className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold">Multimodal Power</h4>
                                <p className="text-muted-foreground">Seamlessly switch between text chat, web search, and image generation in a single interface.</p>
                            </div>
                        </li>
                        <li className="flex items-start">
                            <CheckCircle className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold">User-Centric</h4>
                                <p className="text-muted-foreground">Save your conversations, customize the AI's personality, and manage your usage with a free account.</p>
                            </div>
                        </li>
                         <li className="flex items-start">
                            <CheckCircle className="h-6 w-6 text-primary mr-3 mt-1 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold">Always Current</h4>
                                <p className="text-muted-foreground">With integrated web search, get answers based on the latest information, not just pre-existing knowledge.</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </section>

        {/* Use Cases Section */}
        <section className="py-20 px-4 bg-secondary/50">
            <div className="container mx-auto max-w-6xl">
                 <h2 className="text-3xl font-bold text-center mb-2">Discover the Possibilities</h2>
                <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
                    VTech AI is your partner for a vast range of tasks. Here are just a few ideas to get you started.
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <FeatureCard 
                        icon={<GraduationCap className="h-8 w-8 text-primary" />}
                        title="Learning & Research"
                        description="Explain complex topics, summarize articles, and find up-to-date information for your projects."
                    />
                    <FeatureCard 
                        icon={<Code className="h-8 w-8 text-primary" />}
                        title="Development & Code"
                        description="Generate code snippets, debug errors, and learn new programming concepts and languages."
                    />
                    <FeatureCard 
                        icon={<Sparkles className="h-8 w-8 text-primary" />}
                        title="Creative & Content"
                        description="Write poems, draft emails, brainstorm ideas, and generate unique images for your social media."
                    />
                    <FeatureCard 
                        icon={<Briefcase className="h-8 w-8 text-primary" />}
                        title="Professional Work"
                        description="Prepare for interviews, create presentation outlines, and analyze data with ease."
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
