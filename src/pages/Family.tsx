import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useFamilyStore } from '../stores/familyStore';
import { useAuthStore } from '../stores/authStore';
import { wsClient } from '../lib/websocket';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Plus, Copy, Check, ArrowLeft, Crown, Shield, 
  MessageCircle, Vote, Send, Loader2, UserPlus, LogOut,
  Calendar, Clock, ThumbsUp
} from 'lucide-react';
import { PageLoader, ListSkeleton, TextSkeleton } from '../components/LoadingStates';
import { EmptyState } from '../components/EmptyState';

export function Family() {
  const { familyId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    families,
    currentFamily,
    polls,
    messages,
    typingUsers,
    fetchFamilies,
    fetchFamily,
    fetchPolls,
    fetchMessages,
    createFamily,
    joinFamily,
    leaveFamily,
    sendMessage,
    vote,
    addMessage,
    setTypingUser,
  } = useFamilyStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [newFamilyName, setNewFamilyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'polls'>('chat');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      await fetchFamilies();
      setIsInitialLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    if (familyId) {
      fetchFamily(familyId);
      fetchPolls(familyId);
      fetchMessages(familyId);

      // WebSocket listeners
      const unsubMessage = wsClient.on('NEW_MESSAGE', (msg) => {
        if (msg.familyId === familyId) {
          addMessage(msg);
        }
      });

      const unsubTyping = wsClient.on('USER_TYPING', (data) => {
        if (data.familyId === familyId && data.userId !== user?.id) {
          setTypingUser(data.userId);
        }
      });

      return () => {
        unsubMessage();
        unsubTyping();
      };
    }
  }, [familyId]);

  const handleCreateFamily = async () => {
    if (!newFamilyName.trim()) return;
    setIsLoading(true);
    try {
      const family = await createFamily(newFamilyName);
      setShowCreateModal(false);
      setNewFamilyName('');
      navigate(`/family/${family.id}`);
    } catch (error) {
      console.error('Failed to create family:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinFamily = async () => {
    if (!inviteCode.trim()) return;
    setIsLoading(true);
    try {
      const famId = await joinFamily(inviteCode.toUpperCase());
      setShowJoinModal(false);
      setInviteCode('');
      navigate(`/family/${famId}`);
    } catch (error) {
      console.error('Failed to join family:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !familyId) return;
    try {
      await sendMessage(familyId, messageInput);
      setMessageInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const copyInviteCode = () => {
    if (currentFamily?.inviteCode) {
      navigator.clipboard.writeText(currentFamily.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'OWNER': return <Crown className="w-3 h-3 text-yellow-500" />;
      case 'ADMIN': return <Shield className="w-3 h-3 text-blue-500" />;
      default: return null;
    }
  };

  // Family List View
  if (!familyId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Family Groups</h1>
            <p className="text-sm text-stone-500">Plan meals together with your family</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowJoinModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-700 rounded-lg font-medium hover:bg-stone-200 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Join
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create
            </button>
          </div>
        </div>

        {isInitialLoading ? (
          <>
            <PageLoader message="Loading families..." size="md" />
            <ListSkeleton count={4} showAvatar={true} showAction={false} />
          </>
        ) : families.length === 0 ? (
          <EmptyState
            preset="noFamily"
            primaryAction={{
              label: 'Create Family',
              onClick: () => setShowCreateModal(true),
              variant: 'primary',
              icon: Plus,
            }}
            secondaryAction={{
              label: 'Join Family',
              onClick: () => setShowJoinModal(true),
              variant: 'outline',
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {families.map((family) => (
              <Link
                key={family.id}
                to={`/family/${family.id}`}
                className="bg-white rounded-xl border border-stone-200 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <Users className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="text-xs font-medium text-stone-400">
                    {family.members.length} members
                  </span>
                </div>
                <h3 className="font-semibold text-stone-900 mb-1">{family.name}</h3>
                <div className="flex items-center gap-1 mt-3">
                  {family.members.slice(0, 4).map((member) => (
                    <div
                      key={member.id}
                      className="w-7 h-7 rounded-full bg-stone-200 flex items-center justify-center text-xs font-bold text-stone-600 -ml-1 first:ml-0 border-2 border-white"
                      title={member.user.name}
                    >
                      {member.user.name.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {family.members.length > 4 && (
                    <span className="text-xs text-stone-400 ml-1">
                      +{family.members.length - 4}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Create Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowCreateModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl p-6 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-xl font-bold text-stone-900 mb-4">Create Family Group</h2>
                <input
                  type="text"
                  placeholder="Family name (e.g., The Smiths)"
                  value={newFamilyName}
                  onChange={(e) => setNewFamilyName(e.target.value)}
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl mb-4 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-3 border border-stone-200 rounded-xl font-medium hover:bg-stone-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateFamily}
                    disabled={isLoading || !newFamilyName.trim()}
                    className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                    Create
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Join Modal */}
        <AnimatePresence>
          {showJoinModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowJoinModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl p-6 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-xl font-bold text-stone-900 mb-4">Join Family Group</h2>
                <input
                  type="text"
                  placeholder="Enter invite code"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl mb-4 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none uppercase tracking-widest text-center font-mono"
                  maxLength={8}
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowJoinModal(false)}
                    className="flex-1 py-3 border border-stone-200 rounded-xl font-medium hover:bg-stone-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleJoinFamily}
                    disabled={isLoading || !inviteCode.trim()}
                    className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                    Join
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Family Detail View
  if (!currentFamily) {
    return (
      <div className="space-y-6">
        <Link to="/family" className="flex items-center gap-2 text-stone-600 hover:text-stone-800">
          <ArrowLeft className="w-4 h-4" />
          Back to Families
        </Link>
        <PageLoader message="Loading family details..." />
        <div className="space-y-4">
          <TextSkeleton lines={3} />
          <ListSkeleton count={4} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/family" className="p-2 hover:bg-stone-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-stone-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-stone-900">{currentFamily.name}</h1>
            <p className="text-sm text-stone-500">{currentFamily.members.length} members</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyInviteCode}
            className="flex items-center gap-2 px-3 py-2 bg-stone-100 rounded-lg text-sm font-medium hover:bg-stone-200 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {currentFamily.inviteCode}
          </button>
        </div>
      </div>

      {/* Members */}
      <div className="bg-white rounded-xl border border-stone-200 p-4">
        <h3 className="text-sm font-semibold text-stone-700 mb-3">Members</h3>
        <div className="flex flex-wrap gap-2">
          {currentFamily.members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-2 px-3 py-1.5 bg-stone-50 rounded-full"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700">
                {member.user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-stone-700">{member.user.name}</span>
              {getRoleIcon(member.role)}
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-stone-100 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
            activeTab === 'chat' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          Chat
        </button>
        <button
          onClick={() => setActiveTab('polls')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
            activeTab === 'polls' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500'
          }`}
        >
          <Vote className="w-4 h-4" />
          Meal Polls
        </button>
      </div>

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          <div className="h-96 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <EmptyState
                preset="noMessages"
                compact
                description="No messages yet. Start the conversation!"
              />
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.userId === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                      msg.userId === user?.id
                        ? 'bg-emerald-600 text-white rounded-br-md'
                        : 'bg-stone-100 text-stone-900 rounded-bl-md'
                    }`}
                  >
                    {msg.userId !== user?.id && (
                      <p className="text-xs font-semibold mb-1 opacity-70">{msg.user.name}</p>
                    )}
                    <p className="text-sm">{msg.content}</p>
                    {msg.type === 'MEAL_SHARE' && msg.metadata && (
                      <div className="mt-2 p-2 bg-white/10 rounded-lg">
                        <p className="text-xs font-semibold">{msg.metadata.mealName}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            {typingUsers.size > 0 && (
              <div className="text-xs text-stone-400 italic">Someone is typing...</div>
            )}
          </div>
          <div className="border-t border-stone-200 p-3 flex gap-2">
            <input
              type="text"
              placeholder="Type a message..."
              value={messageInput}
              onChange={(e) => {
                setMessageInput(e.target.value);
                if (familyId) wsClient.sendTyping(familyId);
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
            />
            <button
              onClick={handleSendMessage}
              disabled={!messageInput.trim()}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Polls Tab */}
      {activeTab === 'polls' && (
        <div className="space-y-4">
          {polls.length === 0 ? (
            <div className="bg-white rounded-xl border border-stone-200 p-8 text-center">
              <EmptyState
                preset="noData"
                icon={Vote}
                title="No active polls"
                description="No active polls. Create one to start voting!"
                primaryAction={{
                  label: 'Create Poll',
                  href: `/family/${familyId}/poll/new`,
                  variant: 'primary',
                  icon: Plus,
                }}
              />
            </div>
          ) : (
            polls.map((poll) => (
              <div key={poll.id} className="bg-white rounded-xl border border-stone-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                      {poll.category}
                    </span>
                    <span className="text-sm text-stone-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(poll.date).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="text-xs text-stone-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Closes {new Date(poll.closesAt).toLocaleTimeString()}
                  </span>
                </div>
                <div className="space-y-2">
                  {poll.suggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => vote(poll.id, suggestion.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                        poll.myVote === suggestion.id
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-stone-200 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-stone-900">{suggestion.mealName}</span>
                        <span className="text-xs text-stone-400">by {suggestion.user.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ThumbsUp className={`w-4 h-4 ${poll.myVote === suggestion.id ? 'text-emerald-600' : 'text-stone-400'}`} />
                        <span className="text-sm font-semibold">{suggestion._count?.votes || 0}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Leave Family */}
      {currentFamily.myRole !== 'OWNER' && (
        <button
          onClick={() => {
            if (confirm('Are you sure you want to leave this family?')) {
              leaveFamily(currentFamily.id);
              navigate('/family');
            }
          }}
          className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          Leave Family
        </button>
      )}
    </div>
  );
}
