import React, { useState } from 'react';
import Button from './Button';
import CustomText from './CustomText';
import HorizontalLine from './HorizontalLine';
import Icon from './Icon';
import FilterPills from './FilterPills';
import EmptyStateCard from './EmptyStateCard';
import DateTimeDisplay from './DateTimeDisplay';
import EntryCard from './EntryCard';
import TaskCard from './TaskCard';
import EventCard from './EventCard';
import EventDailyViewCard from './EventDailyViewCard';
import Toggle from './Toggle';
import ProgressBar from './ProgressBar';
import MemberItem from './MemberItem';
import Notification from './Notification';
import ActivityCard from './ActivityCard';
import ProfileItem from './ProfileItem';
import UserAvatarsGroup from './UserAvatarsGroup';
import PlusAdd from './PlusAdd';
import UserBasicInfo from './UserBasicInfo';
import QuoteView from './QuoteView';
import Snackbar from './Snackbar';
import { Colors } from '../styles';
import { IFilterPill, TASK_STATE, SUB_HIVE, ISnackbar, IQuote } from '../util/types';
import { useLanguageContext } from '../context/LanguageContext';

const Home: React.FC = () => {
  const { i18n } = useLanguageContext();
  const [showEmptyState, setShowEmptyState] = useState(false);
  const [selectedPill, setSelectedPill] = useState<string>('');
  const [toggleState, setToggleState] = useState(false);
  const [currentStep, setCurrentStep] = useState(3);
  const totalSteps = 5;
  const [snackbars, setSnackbars] = useState<ISnackbar[]>([]);

  // Sample data for FilterPills
  const filterPills: IFilterPill[] = [
    { text: 'All', isSelected: true, count: 42 },
    { text: 'Tasks', count: 24 },
    { text: 'Events', count: 18 },
    { text: 'Notes', count: 8 },
  ];

  const handlePillSelected = (pill: IFilterPill) => {
    setSelectedPill(pill.text);
    console.log('Selected pill:', pill.text);
  };

  // Function to add a snackbar
  const addSnackbar = (type: "success" | "error" | "warning" | "syncing", message: React.ReactNode) => {
    const newSnackbar: ISnackbar = {
      id: Date.now().toString(),
      message,
      type,
      duration: 5000, // 5 seconds
    };
    setSnackbars(prev => [...prev, newSnackbar]);
  };

  // Function to remove a snackbar
  const removeSnackbar = (id: string) => {
    setSnackbars(prev => prev.filter(snackbar => snackbar.id !== id));
  };

  // Sample quote for QuoteView
  const sampleQuote: IQuote = {
    id: "1",
    attributes: {
      quote: "The only way to do great work is to love what you do.",
      author: "Steve Jobs",
      location: "Stanford Commencement Address",
    }
  };

  return (
    <div className="home-container" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <header className="App-header" style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1>Welcome to Eeva Web</h1>
        <CustomText style={{ fontSize: 18, color: Colors.DARK_GREY }}>
          This is the web version of the Eeva mobile application
        </CustomText>
      </header>
      
      <HorizontalLine color={Colors.LIGHT_GREY} />
      
      <main className="home-content" style={{ marginTop: '30px' }}>
        <CustomText style={{ marginBottom: '20px' }}>
          Below are examples of our converted components from React Native to React Web:
        </CustomText>
        
        <div style={{ marginBottom: '30px' }}>
          <h3>Button Component</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '300px' }}>
            <Button 
              textProps={{ text: 'Primary Button' }} 
              backgroundColor={Colors.BLUE}
            />
            
            <Button 
              textProps={{ text: 'Secondary Button', color: Colors.BLUE }} 
              backgroundColor={Colors.WHITE}
              borderProps={{ width: 1, color: Colors.BLUE, radius: 8 }}
            />
            
            <Button 
              textProps={{ text: 'Disabled Button' }} 
              backgroundColor={Colors.BLUE}
              disabled={true}
            />

            <Button 
              textProps={{ text: 'Show Empty State Card' }} 
              backgroundColor={Colors.SECONDARY_PURPLE}
              onButtonClick={() => setShowEmptyState(true)}
            />
          </div>
        </div>
        
        <HorizontalLine color={Colors.LIGHT_GREY} />
        
        <div style={{ marginTop: '30px', marginBottom: '30px' }}>
          <h3>Text Component</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <CustomText>This is the default text style</CustomText>
            <CustomText style={{ color: Colors.BLUE, fontWeight: '600' }}>This is blue and bold text</CustomText>
            <CustomText style={{ fontSize: 24 }}>This is larger text</CustomText>
          </div>
        </div>
        
        <HorizontalLine color={Colors.LIGHT_GREY} />
        
        <div style={{ marginTop: '30px', marginBottom: '30px' }}>
          <h3>Icon Component</h3>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Icon name="home" color={Colors.BLUE} />
            <Icon name="settings" color={Colors.GREEN} />
            <Icon name="profile" color={Colors.ORANGE} width={32} height={32} />
          </div>
        </div>

        <HorizontalLine color={Colors.LIGHT_GREY} />

        <div style={{ marginTop: '30px', marginBottom: '30px' }}>
          <h3>FilterPills Component</h3>
          <FilterPills 
            pills={filterPills} 
            onPillSelected={handlePillSelected}
            setSelectedItemProp={setSelectedPill}
          />
          {selectedPill && (
            <CustomText style={{ marginTop: '10px', color: Colors.BLUE }}>
              Selected: {selectedPill}
            </CustomText>
          )}
        </div>

        <HorizontalLine color={Colors.LIGHT_GREY} />

        <div style={{ marginTop: '30px', marginBottom: '30px' }}>
          <h3>DateTimeDisplay Component</h3>
          <DateTimeDisplay 
            deadlineStartDateTime="2025-03-15T09:00:00"
            deadlineEndDateTime="2025-03-15T17:00:00"
            scheduledTime="09:00"
            scheduledTimeEnd="17:00"
            frequency={i18n.t('Weekly')}
            reminder="15 minutes before"
          />
        </div>

        <HorizontalLine color={Colors.LIGHT_GREY} />

        <div style={{ marginTop: '30px', marginBottom: '30px' }}>
          <h3>EntryCard Component</h3>
          <EntryCard 
            id={1}
            title="Meeting Notes"
            description="Notes from the team meeting on project planning"
            isPinned={true}
            isSecure={false}
            members={[{ id: 1, name: "John Doe" }, { id: 2, name: "Jane Smith" }]}
            onClick={() => console.log("Entry card clicked")}
          />
        </div>

        <HorizontalLine color={Colors.LIGHT_GREY} />

        <div style={{ marginTop: '30px', marginBottom: '30px' }}>
          <h3>TaskCard Component</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            <TaskCard 
              categoryText="Work"
              header="Complete Project Proposal"
              subHeader="Due tomorrow"
              date="Mar 12, 2025"
              state={TASK_STATE.TO_DO}
              priority={1}
              onClick={() => console.log("Task card clicked")}
              changeState={() => console.log("Task state changed")}
            />
            
            <TaskCard 
              categoryText="Personal"
              header="Grocery Shopping"
              subHeader="Buy ingredients for dinner"
              date="Mar 11, 2025"
              state={TASK_STATE.COMPLETED}
              priority={3}
              onClick={() => console.log("Task card clicked")}
              changeState={() => console.log("Task state changed")}
            />
          </div>
        </div>

        <HorizontalLine color={Colors.LIGHT_GREY} />

        <div style={{ marginTop: '30px', marginBottom: '30px' }}>
          <h3>Toggle Component</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Toggle isActive={toggleState} />
            <Button 
              textProps={{ text: toggleState ? 'Turn Off' : 'Turn On' }} 
              backgroundColor={Colors.BLUE}
              onButtonClick={() => setToggleState(!toggleState)}
            />
          </div>
        </div>

        <HorizontalLine color={Colors.LIGHT_GREY} />

        <div style={{ marginTop: '30px', marginBottom: '30px' }}>
          <h3>EventCard Component</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <EventCard 
              text="Team Meeting"
              time="10:00 AM"
              color={Colors.BLUE}
              type="event"
              eventTimeId="evt-123"
              onPress={() => console.log("Event card clicked")}
            />
            
            <EventCard 
              text="Complete Documentation"
              time="2:00 PM"
              color={Colors.GREEN}
              type="task"
              eventTimeId="evt-456"
              onPress={() => console.log("Event card clicked")}
            />
          </div>
        </div>

        <HorizontalLine color={Colors.LIGHT_GREY} />

        <div style={{ marginTop: '30px', marginBottom: '30px' }}>
          <h3>EventDailyViewCard Component</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', height: '200px' }}>
            <EventDailyViewCard 
              text="Weekly Standup"
              time="9:00 AM"
              color={Colors.BLUE}
              type="event"
              eventTimeId="evt-789"
              start="9:00AM"
              end="9:30AM"
              onPress={() => console.log("Event daily view card clicked")}
            />
            
            <EventDailyViewCard 
              text="Project Review"
              time="2:00 PM"
              color={Colors.ORANGE}
              type="event"
              eventTimeId="evt-101"
              start="2:00PM"
              end="4:00PM"
              onPress={() => console.log("Event daily view card clicked")}
            />
          </div>
        </div>

        <HorizontalLine color={Colors.LIGHT_GREY} />

        <div style={{ marginTop: '30px', marginBottom: '30px' }}>
          <h3>ProgressBar Component</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <ProgressBar 
              currentStep={currentStep} 
              totalSteps={totalSteps} 
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button 
                textProps={{ text: 'Previous Step' }} 
                backgroundColor={Colors.BLUE}
                onButtonClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                disabled={currentStep <= 1}
              />
              <Button 
                textProps={{ text: 'Next Step' }} 
                backgroundColor={Colors.BLUE}
                onButtonClick={() => setCurrentStep(prev => Math.min(totalSteps, prev + 1))}
                disabled={currentStep >= totalSteps}
              />
            </div>
            <CustomText>
              Step {currentStep} of {totalSteps}
            </CustomText>
          </div>
        </div>

        <HorizontalLine color={Colors.LIGHT_GREY} />

        <div style={{ marginTop: '30px', marginBottom: '30px' }}>
          <h3>Notification Component</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <Notification 
              body="Your task 'Complete Project Proposal' is due tomorrow"
              type="Reminder"
              subHive={SUB_HIVE.WORK}
              date="Mar 12, 2025"
              isUnread={true}
            />
            
            <Notification 
              body="Team meeting scheduled for 10:00 AM"
              type="Alert"
              subHive={SUB_HIVE.WORK}
              date="Mar 13, 2025"
              isUnread={false}
            />
            
            <Notification 
              from={{ name: "John Doe", avatar: "https://randomuser.me/api/portraits/men/1.jpg" }}
              body="Added you to the project documentation"
              type="Update"
              subHive={SUB_HIVE.FOOD}
              date="Mar 11, 2025"
              isUnread={true}
            />
          </div>
        </div>

        <HorizontalLine color={Colors.LIGHT_GREY} />

        <div style={{ marginTop: '30px', marginBottom: '30px' }}>
          <h3>ActivityCard Component</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <ActivityCard 
              heading="Added a new task"
              name="John Doe"
              initials="JD"
              avatar="https://randomuser.me/api/portraits/men/1.jpg"
              date="Mar 12, 2025"
              time="10:00 AM"
              onPress={() => console.log("Activity card clicked")}
            />
            
            <ActivityCard 
              heading="Updated project documentation"
              name="Jane Smith"
              initials="JS"
              date="Mar 11, 2025"
              time="2:30 PM"
              onPress={() => console.log("Activity card clicked")}
            />
            
            <ActivityCard 
              heading="Completed weekly report"
              name="Alex Johnson"
              initials="AJ"
              avatar="https://randomuser.me/api/portraits/men/2.jpg"
              date="Mar 10, 2025"
              time="4:15 PM"
              onPress={() => console.log("Activity card clicked")}
            />
          </div>
        </div>

        <HorizontalLine color={Colors.LIGHT_GREY} />

        <div style={{ marginTop: '30px', marginBottom: '30px' }}>
          <h3>MemberItem Component</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', border: `1px solid ${Colors.LIGHT_GREY}`, borderRadius: '8px' }}>
            <MemberItem 
              user={{ 
                FirstName: "John", 
                LastName: "Doe", 
                AvatarImagePath: "https://randomuser.me/api/portraits/men/1.jpg" 
              }}
              isShowPermissionLevel={true}
              onPress={{
                rowPress: () => console.log("Member row clicked")
              }}
            />
            <MemberItem 
              user={{ 
                FirstName: "Jane", 
                LastName: "Smith" 
              }}
              isShowInviteButton={true}
              onPress={{
                buttonPress: () => console.log("Invite button clicked")
              }}
            />
            <MemberItem 
              user={{ 
                FirstName: "Alex", 
                LastName: "Johnson" 
              }}
              isShowPermissionSelector={true}
              onPress={{
                rowPress: () => console.log("Permission selector clicked")
              }}
            />
          </div>
        </div>

        <HorizontalLine color={Colors.LIGHT_GREY} />

        <div style={{ marginTop: '30px', marginBottom: '30px' }}>
          <h3>ProfileItem Component</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', border: `1px solid ${Colors.LIGHT_GREY}`, borderRadius: '8px', padding: '15px' }}>
            <ProfileItem 
              content={{
                value: "John Doe",
                onChange: (value) => console.log("Name changed:", value)
              }}
              editingEnabled={true}
              placeholder="Name"
            />
            
            <ProfileItem 
              content={{
                value: "john.doe@example.com",
                onChange: (value) => console.log("Email changed:", value)
              }}
              editingEnabled={true}
              placeholder={i18n.t('Email')}
            />
            
            <ProfileItem 
              content={{
                value: "123 Main St, San Francisco, CA",
                onChange: (value) => console.log("Address changed:", value)
              }}
              editingEnabled={false}
              placeholder={i18n.t('Address')}
            />
            
            <ProfileItem 
              content={{
                value: "Select Date",
              }}
              editingEnabled={true}
              isButton={true}
              placeholder={i18n.t('DateOfBirth')}
              onPress={() => console.log("Date selector clicked")}
            />
          </div>
        </div>

        <HorizontalLine color={Colors.LIGHT_GREY} />

        <div style={{ marginTop: '30px', marginBottom: '30px' }}>
          <h3>UserAvatarsGroup Component</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '15px' }}>
            <UserAvatarsGroup 
              users={[
                { FirstName: "John", LastName: "Doe", AvatarImagePath: "https://randomuser.me/api/portraits/men/1.jpg" },
                { FirstName: "Jane", LastName: "Smith" },
                { FirstName: "Alex", LastName: "Johnson", AvatarImagePath: "https://randomuser.me/api/portraits/men/2.jpg" },
                { FirstName: "Emily", LastName: "Davis" },
                { FirstName: "Michael", LastName: "Brown" },
                { FirstName: "Sarah", LastName: "Wilson" }
              ]}
              size={4}
            />
            
            <CustomText style={{ marginTop: '10px' }}>Group with 3 members:</CustomText>
            <UserAvatarsGroup 
              users={[
                { FirstName: "John", LastName: "Doe", AvatarImagePath: "https://randomuser.me/api/portraits/men/1.jpg" },
                { FirstName: "Jane", LastName: "Smith" },
                { FirstName: "Alex", LastName: "Johnson", AvatarImagePath: "https://randomuser.me/api/portraits/men/2.jpg" }
              ]}
              size={3}
            />
          </div>
        </div>

        <HorizontalLine color={Colors.LIGHT_GREY} />

        <div style={{ marginTop: '30px', marginBottom: '30px' }}>
          <h3>PlusAdd Component</h3>
          <div style={{ display: 'flex', gap: '20px', padding: '15px' }}>
            <PlusAdd color={Colors.BLUE} size={24} />
            <PlusAdd color={Colors.GREEN} size={32} />
            <PlusAdd color={Colors.SECONDARY_PURPLE} size={48} />
          </div>
        </div>

        <HorizontalLine color={Colors.LIGHT_GREY} />

        <div style={{ marginTop: '30px', marginBottom: '30px' }}>
          <h3>UserBasicInfo Component</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <UserBasicInfo 
              name="John Doe"
              message="Product Designer"
              avatar="https://randomuser.me/api/portraits/men/32.jpg"
            />
            <UserBasicInfo 
              name="Sarah Smith"
              message="UX Researcher"
              editAvatar={true}
              onEditAvatarPress={() => console.log('Edit avatar pressed')}
            />
          </div>
        </div>

        <HorizontalLine color={Colors.LIGHT_GREY} />

        <div style={{ marginTop: '30px', marginBottom: '30px' }}>
          <h3>QuoteView Component</h3>
          <QuoteView quote={sampleQuote} />
        </div>

        <HorizontalLine color={Colors.LIGHT_GREY} />

        <div style={{ marginTop: '30px', marginBottom: '30px' }}>
          <h3>Snackbar Component</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <Button 
              textProps={{ text: 'Show Success Snackbar' }} 
              backgroundColor={Colors.BLUE}
              onButtonClick={() => addSnackbar("success", "This is a success snackbar")}
            />
            <Button 
              textProps={{ text: 'Show Error Snackbar' }} 
              backgroundColor={Colors.BLUE}
              onButtonClick={() => addSnackbar("error", "This is an error snackbar")}
            />
            <Button 
              textProps={{ text: 'Show Warning Snackbar' }} 
              backgroundColor={Colors.BLUE}
              onButtonClick={() => addSnackbar("warning", "This is a warning snackbar")}
            />
            <Button 
              textProps={{ text: 'Show Syncing Snackbar' }} 
              backgroundColor={Colors.BLUE}
              onButtonClick={() => addSnackbar("syncing", "This is a syncing snackbar")}
            />
          </div>
          <div style={{ marginTop: '20px' }}>
            {snackbars.map(snackbar => (
              <Snackbar 
                key={snackbar.id} 
                snackbar={snackbar}
                onClose={removeSnackbar}
              />
            ))}
          </div>
        </div>
      </main>

      {showEmptyState && <EmptyStateCard onClose={() => setShowEmptyState(false)} />}
    </div>
  );
};

export default Home;
