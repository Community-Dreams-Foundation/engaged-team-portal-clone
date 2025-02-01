import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CalendarDays, Users, Briefcase, GraduationCap } from "lucide-react";

const Index = () => {
  const benefits = [
    {
      icon: <Users className="h-6 w-6" />,
      title: "Global Community",
      description: "Join a diverse network of professionals and innovators worldwide",
    },
    {
      icon: <Briefcase className="h-6 w-6" />,
      title: "Real Projects",
      description: "Work on impactful projects with CDF and partner organizations",
    },
    {
      icon: <GraduationCap className="h-6 w-6" />,
      title: "Career Growth",
      description: "Access AI-driven tools and resources for professional development",
    },
    {
      icon: <CalendarDays className="h-6 w-6" />,
      title: "Structured Program",
      description: "Follow a clear path to success with dedicated support",
    },
  ];

  const faqs = [
    {
      question: "What is DreamStream?",
      answer: "DreamStream is an advanced platform created by the Community Dreams Foundation (CDF) to provide career growth opportunities, real-world project experience, and professional tools. It combines hands-on learning, collaboration, and AI-driven resources to empower our team and partners.",
    },
    {
      question: "Is joining the DreamStream Fellowship mandatory?",
      answer: "Yes. The fellowship is mandatory for all team members and leaders at CDF, including project managers, team leads, and captains. It ensures everyone has access to essential tools, resources, and opportunities while supporting the operational structure of CDF.",
    },
    {
      question: "What is the subscription fee?",
      answer: "The subscription fee is $15 monthly, which sustains DreamStream's platform, supporting tools like the Portfolio Builder, compliance tracking, and professional growth resources. It is an investment in your future and helps maintain the quality of the program.",
    },
    {
      question: "When are the important deadlines?",
      answer: "Launch Form must be completed by December 16, 2024, and payment can be made up until January 5, 2025.",
    },
    {
      question: "Are there any waivers available?",
      answer: "Yes, waiver options include Leadership Waiver, Sweat Equity Waiver, Competition Waiver, and Hardship Waiver. Specific criteria and details will be shared soon.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-sidebar-primary text-white">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            DreamStream Fellowship
          </h1>
          <p className="text-xl sm:text-2xl mb-8 max-w-3xl mx-auto">
            Empowering team members with professional tools, real-world experience, and career growth opportunities.
          </p>
          <Button size="lg" className="bg-white text-sidebar-primary hover:bg-gray-100">
            Join DreamStream Now
          </Button>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Join DreamStream?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-none shadow-lg">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 bg-sidebar-accent rounded-full w-fit">
                    {benefit.icon}
                  </div>
                  <CardTitle className="text-xl">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground">
                  {benefit.description}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Subscription Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-sidebar-accent">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <Card className="p-8">
            <CardHeader>
              <CardTitle className="text-2xl">DreamStream Membership</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold mb-4">$15<span className="text-xl text-muted-foreground">/month</span></p>
              <ul className="text-left space-y-4 mb-8">
                <li className="flex items-center gap-2">✓ Portfolio Builder Access</li>
                <li className="flex items-center gap-2">✓ Professional Growth Tools</li>
                <li className="flex items-center gap-2">✓ Project Opportunities</li>
                <li className="flex items-center gap-2">✓ Community Support</li>
              </ul>
              <Button className="w-full" size="lg">
                Subscribe Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center text-muted-foreground">
        <p>One Team, One Dream</p>
        <p className="mt-2">Contact: DreamStream@cdreams.org</p>
      </footer>
    </div>
  );
};

export default Index;