import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/context/auth-context";
import {
  ArrowRight,
  Heart,
  Star,
  Info,
  Users,
  Globe,
  Clock,
} from "lucide-react";
import DonationCard from "@/components/DonationCard";
import { Skeleton } from "@/components/ui/skeleton";
import image from "../images/photo_2025-03-25_03-24-18.jpg";
import image2 from "../images/donation3.jpg";

interface DonationPost {
  id: number;
  thumbnail_url: string;
  organizer_name: string;
  organizer_avatar: string;
  description: string;
  target_amount: number;
  current_amount: number;
  start_date: string;
  end_date: string;
}

const About = () => {
  const [urgentCampaigns, setUrgentCampaigns] = useState<DonationPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUrgentCampaigns = async () => {
      try {
        const { data, error } = await supabase
          .from("donation_posts")
          .select("*")
          .order("end_date", { ascending: true })
          .limit(2);

        if (error) throw error;
        setUrgentCampaigns(data || []);
      } catch (error) {
        console.error("Error fetching urgent campaigns:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUrgentCampaigns();
  }, []);

  return (
    <div className="min-h-screen pb-16">
      {/* Enhanced Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Background with gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 to-amber-800/40 z-10"></div>
        <div className="absolute inset-0">
          <img
            src={image2}
            alt="Hero background"
            className="w-full h-full object-cover opacity-30"
          />
        </div>

        {/* Content */}
        <div className="container max-w-6xl mx-auto px-4 py-16 relative z-20">
          <div className="flex flex-col items-center text-center">
            <Heart className="w-16 h-16 text-amber-400 mb-6 animate-pulse" />
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-white">
              About <span className="text-amber-400">Us</span>
            </h1>
            <p className="text-xl mb-10 text-white/90 max-w-3xl">
              Learn more about our mission to connect donors with causes that
              matter and how we're making a difference in communities worldwide.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-amber text-black hover:bg-amber-dark animate-fade-in"
              >
                <Link to="/">Donate Now</Link>
              </Button>
              {/* <Button
                asChild
                variant="outline"
                size="lg"
                className="text-white border-white hover:bg-white/10 animate-fade-in"
              >
                <Link to="/donations/new">Start a Campaign</Link>
              </Button> */}
            </div>
          </div>
        </div>
      </section>

      {/* Our Story Section - with improved design */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold tracking-tight mb-6 text-amber-500">
                Our Story
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
                Founded in 2023, our platform was born from a simple belief:
                that giving should be easy, transparent, and impactful. We saw a
                gap between people who wanted to help and the causes that needed
                support.
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
                Our team of dedicated professionals works tirelessly to ensure
                that every donation reaches its intended destination, and that
                donors can see the real impact of their generosity.
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Today, we've helped thousands of campaigns raise millions of
                dollars for causes ranging from disaster relief to education
                initiatives, medical treatments, and community development
                projects.
              </p>
            </div>
            <div className="md:w-1/2 rounded-2xl overflow-hidden shadow-2xl transform md:translate-y-4">
              <img
                src={image}
                alt="Team working together"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section - with improved card design */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight mb-6 text-amber-500">
              Our Values
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
              These principles guide everything we do, from platform development
              to campaign support and donor engagement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-900 p-8 rounded-xl text-center shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 dark:border-gray-800">
              <div className="bg-amber-100 dark:bg-amber-900/30 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6">
                <Heart className="h-8 w-8 text-amber" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Compassion</h3>
              <p className="text-gray-600 dark:text-gray-400">
                We believe in the power of empathy and understanding to drive
                meaningful change in communities worldwide.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-8 rounded-xl text-center shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 dark:border-gray-800">
              <div className="bg-amber-100 dark:bg-amber-900/30 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-amber" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Community</h3>
              <p className="text-gray-600 dark:text-gray-400">
                We foster connections between donors, organizers, and
                beneficiaries to create a global network of support.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 p-8 rounded-xl text-center shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 dark:border-gray-800">
              <div className="bg-amber-100 dark:bg-amber-900/30 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6">
                <Globe className="h-8 w-8 text-amber" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Transparency</h3>
              <p className="text-gray-600 dark:text-gray-400">
                We maintain open communication about where donations go and how
                they're used to build trust with our users.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Urgent Campaigns Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-4xl font-bold tracking-tight text-amber-500">
              Urgent Campaigns
            </h2>
            <Button variant="ghost" asChild className="text-lg">
              <Link to="/donations" className="flex items-center">
                View All <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2].map((n) => (
                <div
                  key={n}
                  className="animate-pulse rounded-lg overflow-hidden"
                >
                  <Skeleton className="h-48 w-full" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : urgentCampaigns.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <Info className="h-16 w-16 mx-auto text-amber-400 mb-4" />
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
                No urgent campaigns at the moment
              </p>
              <Button
                asChild
                size="lg"
                className="bg-amber text-black hover:bg-amber-dark"
              >
                <Link to="/donations/new">Start a Campaign</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {urgentCampaigns.map((post) => (
                <DonationCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Enhanced Call to Action Section */}
      <section className="py-20 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20">
        <div className="container max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Make an Impact Today</h2>
          <p className="text-xl mb-10 max-w-3xl mx-auto text-gray-700 dark:text-gray-300">
            Whether you're looking to support a cause or start your own
            campaign, you can make a difference right now.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Button
              asChild
              size="lg"
              className="bg-amber text-black hover:bg-amber-dark"
            >
              <Link to="/">Donate Now</Link>
            </Button>
            {/* <Button asChild variant="outline" size="lg">
              <Link to="/donations/new">Start a Campaign</Link>
            </Button> */}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
