import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase'; 
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { ExternalLink, Github, Linkedin, Instagram, Twitter, Globe, Phone, Mail } from 'lucide-react';

const Profile = () => {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  /**
   * Generates and downloads a .vcf file (vCard)
   * Only includes links where isEnabled is true
   */
  const saveContact = () => {
    if (!userData) return;

    // Helper: Finds a link by keyword ONLY if it is enabled
    const getEnabledLink = (keywords) => {
      const found = links.find(l => 
        l.isEnabled && keywords.some(key => l.name.toLowerCase().includes(key))
      );
      return found ? found.link : '';
    };

    const phoneNumber = getEnabledLink(['phone', 'whatsapp', 'mobile']);
    const emailAddress = getEnabledLink(['mail', 'email']);
    const website = getEnabledLink(['portfolio', 'website', 'globe']);

    // vCard Format Construction
    const vCard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${userData.name}`,
      `TITLE:${userData.title || ''}`,
      `TEL;TYPE=CELL:${phoneNumber}`,
      `EMAIL;TYPE=INTERNET:${emailAddress}`,
      `URL:${website}`,
      'END:VCARD'
    ].join('\n');

    // Create a download link for the file
    const blob = new Blob([vCard], { type: 'text/vcard' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${userData.name.replace(/\s+/g, '_')}.vcf`);
    document.body.appendChild(link);
    link.click();
    
    // Cleanup memory
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Logic to map link names to Lucide icons
  const getIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes('github')) return <Github className="w-5 h-5" />;
    if (n.includes('linkedin')) return <Linkedin className="w-5 h-5" />;
    if (n.includes('instagram')) return <Instagram className="w-5 h-5" />;
    if (n.includes('twitter') || n.includes('x')) return <Twitter className="w-5 h-5" />;
    if (n.includes('portfolio') || n.includes('website')) return <Globe className="w-5 h-5" />;
    if (n.includes('phone') || n.includes('whatsapp')) return <Phone className="w-5 h-5" />;
    if (n.includes('mail') || n.includes('email')) return <Mail className="w-5 h-5" />;
    return <ExternalLink className="w-5 h-5" />;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch User basic info
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          setUserData(userSnap.data());
        }

        // Fetch User links sub-collection
        const linksRef = collection(db, "users", userId, "links");
        const querySnapshot = await getDocs(linksRef);
        const linksList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setLinks(linksList);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  if (loading) return (
    <div className="h-screen bg-[#050505] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
    </div>
  );

  if (!userData) return (
    <div className="h-screen bg-[#050505] flex items-center justify-center text-gray-500 uppercase tracking-widest text-sm">
      User not found
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30 font-sans">
      {/* Visual Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-purple-600/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative max-w-md mx-auto px-6 py-16 flex flex-col items-center">
        {/* Profile Header (Avatar) */}
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-600 to-blue-400 p-[2px] mb-6 rotate-3 hover:rotate-0 transition-transform duration-500 shadow-2xl shadow-blue-500/20">
          <div className="w-full h-full bg-[#0a0a0a] rounded-[22px] flex items-center justify-center text-3xl font-black">
            {userData.name?.charAt(0)}
          </div>
        </div>

        {/* User Titles */}
        <h1 className="text-3xl font-bold tracking-tight text-center">{userData.name}</h1>
        <p className="text-gray-400 mt-2 mb-10 text-center font-medium">{userData.title}</p>

        {/* Dynamic Links List */}
        <div className="w-full space-y-3">
          {links.map((item) => (
            item.isEnabled && (
              <a
                key={item.id}
                href={item.link.startsWith('http') ? item.link : `https://${item.link}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between w-full p-4 bg-[#111111] border border-white/5 rounded-2xl hover:bg-[#161616] hover:border-white/10 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white/5 rounded-xl group-hover:bg-blue-500/10 group-hover:text-blue-400 transition-colors">
                    {getIcon(item.name)}
                  </div>
                  <span className="font-semibold text-gray-200 group-hover:text-white">{item.name}</span>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-gray-400" />
              </a>
            )
          ))}
        </div>

        {/* Main Action: Save to Contacts */}
        <button 
          onClick={saveContact}
          className="mt-12 w-full py-4 bg-white text-black rounded-2xl font-bold hover:bg-gray-100 transition-all shadow-xl shadow-white/5 active:scale-95 flex items-center justify-center gap-2"
        >
          Save Contact
        </button>
      </div>
    </div>
  );
};

export default Profile;