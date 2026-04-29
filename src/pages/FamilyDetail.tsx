import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useAuthStore } from '../stores/authStore.js';
import { 
  Users, Send, UserPlus, Settings, Copy, Check, Trash2, 
  Crown, Shield, User, Loader2, ArrowLeft, MessageCircle,
  ChefHat
} from 'lucide-react';

interface Member {
  id: string;
  userId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email?: string;
    avatar?: string;
  };
}

interface Message {
  id: string;
  content: string;
  type: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  metadata?: any;
}

interface Family {
  id: string;
  name: string;
  inviteCode: string;
  ownerId: string;
  members: Member[];
  messages: Message[];
}

export function FamilyDetail() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [family, setFamily] = useState<Family | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [addMemberError, setAddMemberError] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'members'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) loadFamily();
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadFamily = async () => {
    try {
      setIsLoading(true);
      const data = await api.getFamily(id!);
      setFamily(data);
      setMessages(data.messages?.reverse() || []);
      setMembers(data.members || []);
    } catch (error) {
      console.error('Failed to load family:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const message = await api.sendFamilyMessage(id!, newMessage.trim());
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const addMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail.trim()) return;

    setIsAddingMember(true);
    setAddMemberError('');
    try {
      const member = await api.addFamilyMember(id!, newMemberEmail.trim());
      setMembers(prev => [...prev, member]);
      setNewMemberEmail('');
      setShowAddMember(false);
    } catch (error: any) {
      setAddMemberError(error.message || 'Failed to add member');
    } finally {
      setIsAddingMember(false);
    }
  };

  const removeMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;
    try {
      await api.removeFamilyMember(id!, userId);
      setMembers(prev => prev.filter(m => m.userId !== userId));
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  const copyInviteCode = () => {
    if (family?.inviteCode) {
      navigator.clipboard.writeText(family.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'OWNER': return <Crown className="w-4 h-4 text-amber-500" />;
      case 'ADMIN': return <Shield className="w-4 h-4 text-blue-500" />;
      default: return <User className="w-4 h-4 text-stone-400" />;
    }
  };

  const currentUserRole = members.find(m => m.userId === user?.id)?.role;
  const canManageMembers = currentUserRole === 'OWNER' || currentUserRole === 'ADMIN';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!family) {
    return (
      <div className="text-center py-20">
        <p className="text-stone-500">Family not found</p>
        <Link to="/family" className="text-emerald-600 hover:underline mt-2 inline-block">
          Back to Families
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/family" className="p-2 hover:bg-stone-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-stone-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-stone-900">{family.name}</h1>
          <p className="text-sm text-stone-500">{members.length} members</p>
        </div>
        <button
          onClick={copyInviteCode}
          className="flex items-center gap-2 px-3 py-2 bg-stone-100 hover:bg-stone-200 rounded-lg text-sm transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : family.inviteCode}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b border-stone-200">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
            activeTab === 'chat' 
              ? 'border-emerald-600 text-emerald-600' 
              : 'border-transparent text-stone-500 hover:text-stone-700'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          Chat
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
            activeTab === 'members' 
              ? 'border-emerald-600 text-emerald-600' 
              : 'border-transparent text-stone-500 hover:text-stone-700'
          }`}
        >
          <Users className="w-4 h-4" />
          Members ({members.length})
        </button>
      </div>

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          {/* Messages */}
          <div className="h-[500px] overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-20 text-stone-400">
                <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.user.id === user?.id ? 'flex-row-reverse' : ''}`}
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    {msg.user.avatar ? (
                      <img src={msg.user.avatar} alt="" className="w-8 h-8 rounded-full" />
                    ) : (
                      <span className="text-sm font-medium text-emerald-600">
                        {msg.user.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className={`max-w-[70%] ${msg.user.id === user?.id ? 'text-right' : ''}`}>
                    <p className="text-xs text-stone-400 mb-1">{msg.user.name}</p>
                    <div
                      className={`inline-block px-4 py-2 rounded-2xl ${
                        msg.type === 'MEMBER_JOINED'
                          ? 'bg-stone-100 text-stone-600 text-sm italic'
                          : msg.type === 'MEAL_SHARE'
                          ? 'bg-emerald-50 border border-emerald-200'
                          : msg.user.id === user?.id
                          ? 'bg-emerald-600 text-white'
                          : 'bg-stone-100 text-stone-800'
                      }`}
                    >
                      {msg.type === 'MEAL_SHARE' && msg.metadata?.mealName ? (
                        <div className="flex items-center gap-2">
                          <ChefHat className="w-4 h-4 text-emerald-600" />
                          <span>Shared: {msg.metadata.mealName}</span>
                        </div>
                      ) : (
                        msg.content
                      )}
                    </div>
                    <p className="text-xs text-stone-400 mt-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={sendMessage} className="border-t border-stone-200 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-stone-200 rounded-full focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || isSending}
                className="p-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {isSending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div className="bg-white rounded-xl border border-stone-200">
          {/* Add Member Button */}
          {canManageMembers && (
            <div className="p-4 border-b border-stone-200">
              {showAddMember ? (
                <form onSubmit={addMember} className="space-y-3">
                  <input
                    type="email"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    placeholder="Enter login email (e.g. john@example.com)"
                    className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    autoFocus
                  />
                  {addMemberError && (
                    <p className="text-sm text-red-600">{addMemberError}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={isAddingMember || !newMemberEmail.trim()}
                      className="flex-1 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                    >
                      {isAddingMember ? 'Adding...' : 'Add Member'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowAddMember(false); setAddMemberError(''); setNewMemberEmail(''); }}
                      className="px-4 py-2 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setShowAddMember(true)}
                  className="flex items-center gap-2 w-full py-2 px-4 border-2 border-dashed border-stone-200 rounded-lg text-stone-500 hover:border-emerald-300 hover:text-emerald-600 transition-colors"
                >
                  <UserPlus className="w-5 h-5" />
                  Add Member by Email
                </button>
              )}
            </div>
          )}

          {/* Members List */}
          <div className="divide-y divide-stone-100">
            {members.map(member => (
              <div key={member.id} className="flex items-center gap-4 p-4 hover:bg-stone-50">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  {member.user.avatar ? (
                    <img src={member.user.avatar} alt="" className="w-10 h-10 rounded-full" />
                  ) : (
                    <span className="font-medium text-emerald-600">
                      {member.user.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-stone-900">{member.user.name}</span>
                    {getRoleIcon(member.role)}
                    {member.userId === user?.id && (
                      <span className="text-xs text-emerald-600">(You)</span>
                    )}
                  </div>
                  <p className="text-sm text-stone-500">
                    {member.user.email || `Member ID: ${member.userId.slice(0, 8)}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-400 capitalize">{member.role.toLowerCase()}</span>
                  {canManageMembers && member.role !== 'OWNER' && member.userId !== user?.id && (
                    <button
                      onClick={() => removeMember(member.userId)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
