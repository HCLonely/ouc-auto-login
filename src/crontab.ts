import * as dayjs from 'dayjs';
const crontabData = (PCUserSid: string, workDir: string, filePath: string, username: string, password: string, interval: string = '30') => `<?xml version="1.0" encoding="UTF-16"?>
<Task version="1.2" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task">
  <RegistrationInfo>
    <Date>${dayjs().format('YYYY-MM-DDTHH:mm:ss.SSS0000')}</Date>
    <Author>HCLonely</Author>
    <Description>Automatically log in to OUC-AUTO campus network account of Ocean University of China.</Description>
    <URI>\\OUC-AUTO-Login</URI>
  </RegistrationInfo>
  <Triggers>
    <CalendarTrigger>
      <Repetition>
        <Interval>PT${interval}M</Interval>
        <Duration>P1D</Duration>
        <StopAtDurationEnd>false</StopAtDurationEnd>
      </Repetition>
      <StartBoundary>${dayjs().format('YYYY-MM-DD')}T00:00:00</StartBoundary>
      <ExecutionTimeLimit>PT${interval}M</ExecutionTimeLimit>
      <Enabled>true</Enabled>
      <ScheduleByDay>
        <DaysInterval>1</DaysInterval>
      </ScheduleByDay>
    </CalendarTrigger>
    <BootTrigger>
      <Enabled>true</Enabled>
    </BootTrigger>
  </Triggers>
  <Principals>
    <Principal id="Author">
      <UserId>${PCUserSid}</UserId>
      <LogonType>Password</LogonType>
      <RunLevel>LeastPrivilege</RunLevel>
    </Principal>
  </Principals>
  <Settings>
    <MultipleInstancesPolicy>StopExisting</MultipleInstancesPolicy>
    <DisallowStartIfOnBatteries>false</DisallowStartIfOnBatteries>
    <StopIfGoingOnBatteries>true</StopIfGoingOnBatteries>
    <AllowHardTerminate>false</AllowHardTerminate>
    <StartWhenAvailable>true</StartWhenAvailable>
    <RunOnlyIfNetworkAvailable>false</RunOnlyIfNetworkAvailable>
    <IdleSettings>
      <StopOnIdleEnd>true</StopOnIdleEnd>
      <RestartOnIdle>false</RestartOnIdle>
    </IdleSettings>
    <AllowStartOnDemand>true</AllowStartOnDemand>
    <Enabled>true</Enabled>
    <Hidden>false</Hidden>
    <RunOnlyIfIdle>false</RunOnlyIfIdle>
    <WakeToRun>true</WakeToRun>
    <ExecutionTimeLimit>PT0S</ExecutionTimeLimit>
    <Priority>7</Priority>
  </Settings>
  <Actions Context="Author">
    <Exec>
      <Command>${filePath}</Command>
      <Arguments>username=${username} password=${password}</Arguments>
      <WorkingDirectory>${workDir}</WorkingDirectory>
    </Exec>
  </Actions>
</Task>`;
const crontabDataMac = (workDir: string, filePath: string, username: string, password: string, interval: string = '30') => `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.hclonely.oucautologin</string>

    <key>ProgramArguments</key>
    <array>
        <string>${filePath}</string>
        <string>username=${username}</string>
        <string>password=${password}</string>
        <string>workDir=${workDir}</string>
    </array>

    <key>WorkingDirectory</key>
    <string>${workDir}</string>

    <key>StartInterval</key>
    <integer>${interval}</integer>

    <key>StandardOutPath</key>
    <string>${workDir}/oucautologin_output.log</string>

    <key>StandardErrorPath</key>
    <string>${workDir}/oucautologin_error.log</string>
</dict>
</plist>`;

export { crontabData, crontabDataMac };
