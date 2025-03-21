import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { TEAM_MEMBERS } from "@/lib/constants";
import { 
  Twitter, 
  Linkedin, 
  Github, 
  MessageCircle, 
  Hash, // Replacing Discord with Hash icon
  Instagram 
} from "lucide-react";

export default function TeamSection() {
  const [ref, controls] = useScrollReveal();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <section id="team" className="py-20 relative bg-dark/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold font-space mb-4"
          >
            Meet Our Team
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto"
          >
            The visionaries behind TRUMP&ELON.
          </motion.p>
        </div>
        
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {TEAM_MEMBERS.map((member, index) => (
            <TeamMemberCard key={index} member={member} index={index} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function TeamMemberCard({ member, index }: { member: typeof TEAM_MEMBERS[0]; index: number }) {
  return (
    <motion.div variants={{
      hidden: { opacity: 0, y: 30 },
      visible: { 
        opacity: 1, 
        y: 0, 
        transition: { duration: 0.5, delay: index * 0.1 } 
      }
    }}>
      <Card className="backdrop-blur-md bg-dark/50 border border-gray-800 rounded-2xl p-6 text-center h-full">
        <div className="relative w-32 h-32 mx-auto mb-4">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/30 to-primary-light/30 flex items-center justify-center overflow-hidden border-2 border-primary-light">
            <svg viewBox="0 0 24 24" className="w-16 h-16 text-primary-light/70">
              <path 
                fill="currentColor" 
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"
              />
            </svg>
          </div>
        </div>
        <h3 className="text-xl font-bold mb-1">{member.name}</h3>
        <p className="text-primary-light mb-4">{member.role}</p>
        <p className="text-gray-300 text-sm mb-4">
          {member.bio}
        </p>
        <div className="flex justify-center space-x-3">
          {member.socials.twitter && (
            <a href={member.socials.twitter} className="text-gray-400 hover:text-primary-light transition-colors">
              <Twitter className="h-5 w-5" />
            </a>
          )}
          {member.socials.linkedin && (
            <a href={member.socials.linkedin} className="text-gray-400 hover:text-primary-light transition-colors">
              <Linkedin className="h-5 w-5" />
            </a>
          )}
          {member.socials.github && (
            <a href={member.socials.github} className="text-gray-400 hover:text-primary-light transition-colors">
              <Github className="h-5 w-5" />
            </a>
          )}
          {member.socials.telegram && (
            <a href={member.socials.telegram} className="text-gray-400 hover:text-primary-light transition-colors">
              <MessageCircle className="h-5 w-5" />
            </a>
          )}
          {member.socials.discord && (
            <a href={member.socials.discord} className="text-gray-400 hover:text-primary-light transition-colors">
              <Hash className="h-5 w-5" />
            </a>
          )}
          {member.socials.instagram && (
            <a href={member.socials.instagram} className="text-gray-400 hover:text-primary-light transition-colors">
              <Instagram className="h-5 w-5" />
            </a>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
