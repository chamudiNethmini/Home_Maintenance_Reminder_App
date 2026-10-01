import { Text } from 'react-native';
import { Badge, Button, Card, Detail, Icon, Page, ui } from '../../components/provider/ProviderUI';
import { MutationState } from '../../components/provider/ProviderDataState';
import { useAuth } from '../../components/auth/AuthContext';
import { useProviderMutation } from '../../utils/useProviderData';
export default function ProviderProfileScreen() {
  const { user, logout } = useAuth(), mutation = useProviderMutation();
  return <Page title="Provider Profile" subtitle="Your FixMate workspace"><Card><Icon name="person-circle-outline" size={64} /><Text style={ui.heading}>{user?.name || 'Warranty Provider'}</Text><Badge status="Warranty Provider" /><Detail label="Email" value={user?.email || 'Unavailable'} /><Detail label="Provider UID" value={user?.uid || 'Unavailable'} /><Detail label="Workspace" value="FixMate" /><Detail label="Mode" value="Cloud Firestore" /></Card><MutationState {...mutation} /><Button title="Log out" kind="secondary" disabled={mutation.pending} onPress={() => { void mutation.run(logout, ''); }} /></Page>;
}
