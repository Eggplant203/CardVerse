import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { CardAPI } from '@/services/api/cardAPI';

const Home: NextPage = () => {
  const auth = useAuth();
  const [hasCards, setHasCards] = useState<boolean>(false);

  useEffect(() => {
    const checkUserCards = async () => {
      try {
        const result = await CardAPI.getUserCards(auth.user?.id || null, auth.isGuestMode);
        if (result.success && result.data && result.data.length > 0) {
          setHasCards(true);
        } else {
          setHasCards(false);
        }
      } catch (error) {
        console.error('Error checking user cards:', error);
        setHasCards(false);
      }
    };

    checkUserCards();
  }, [auth.user?.id, auth.isGuestMode]);
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-gray-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="hero flex flex-col md:flex-row items-center justify-between py-16">
          <motion.div 
            className="content max-w-xl"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl md:text-5xl font-title mb-4 text-white">
              <span className="text-blue-400">AI-Powered</span> Card Game
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              Turn your photos into powerful battle cards using advanced AI technology.
              Create unique cards, build decks, and battle other players in strategic combat.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/create" className="block">
                <Button size="lg">
                  {hasCards ? 'Create New Card' : 'Create Your First Card'}
                </Button>
              </Link>
              <Link href="/play" className="block">
                <Button variant="outline" size="lg">Play Now</Button>
              </Link>
            </div>
          </motion.div>
          
          <motion.div 
            className="image mt-8 md:mt-0 overflow-visible"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="card-preview relative w-64 h-96">
              <div className="absolute top-0 left-0 w-64 h-96 transform rotate-[-15deg] translate-x-[10px] md:translate-x-[-140px] translate-y-[20px]">
                <Image src="/card-example-1.jpg" alt="Example Card" width={256} height={384} className="rounded-lg shadow-xl" unoptimized priority />
              </div>
              <div className="absolute top-0 left-0 w-64 h-96 transform rotate-[5deg] translate-x-[20px] md:translate-x-[-80px] translate-y-[-10px]">
                <Image src="/card-example-2.jpg" alt="Example Card" width={256} height={384} className="rounded-lg shadow-xl" unoptimized priority />
              </div>
            </div>
          </motion.div>
        </section>
        
        {/* Features Section */}
        <section className="features py-16">
          <h3 className="text-3xl font-title text-center mb-12 text-white">
            Game Features
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon="🧠" 
              title="AI Card Generation"
              description="Upload any photo and watch as our AI analyzes it to create a unique card with appropriate stats and abilities."
            />
            <FeatureCard 
              icon="⚔️" 
              title="Strategic Combat"
              description="Position your cards on a 6-slot battlefield with front and back rows. Plan your moves and outmaneuver your opponents."
            />
            <FeatureCard 
              icon="🏆" 
              title="Build Collections"
              description="Create and collect cards, build powerful decks, and rise through the ranks in PVP battles."
            />
          </div>
        </section>
        
        {/* How It Works Section */}
        <section className="how-it-works py-16">
          <h3 className="text-3xl font-title text-center mb-12 text-white">
            How It Works
          </h3>
          
          <div className="steps flex flex-col md:flex-row justify-between">
            <Step number={1} title="Upload Your Photo" description="Choose any photo you want to turn into a card" />
            <Step number={2} title="AI Analysis" description="Our AI analyzes the image and generates appropriate card stats" />
            <Step number={3} title="Card Creation" description="Your unique card is created and added to your collection" />
            <Step number={4} title="Battle" description="Use your cards to battle against other players" />
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-900 py-8 text-center text-gray-400 text-sm">
        <div className="container mx-auto px-4">
          <p>© 2025 EGGPLANT STUDIO 🍆 - Transform Anything into Epic Cards</p>
        </div>
      </footer>
    </div>
  );
};

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <motion.div 
      className="feature-card bg-gray-800 bg-opacity-50 rounded-lg p-6"
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <div className="icon text-4xl mb-4">{icon}</div>
      <h4 className="title text-xl font-title text-white mb-2">{title}</h4>
      <p className="description text-gray-300">{description}</p>
    </motion.div>
  );
};

interface StepProps {
  number: number;
  title: string;
  description: string;
}

const Step: React.FC<StepProps> = ({ number, title, description }) => {
  return (
    <motion.div 
      className="step flex flex-col items-center text-center mb-8 md:mb-0 px-4"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: number * 0.1 }}
      viewport={{ once: true }}
    >
      <div className="number bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white mb-4">
        {number}
      </div>
      <h4 className="title text-xl font-title text-white mb-2">{title}</h4>
      <p className="description text-gray-300">{description}</p>
    </motion.div>
  );
};

export default Home;
