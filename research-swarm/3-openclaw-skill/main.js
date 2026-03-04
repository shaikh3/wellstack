/**
 * WellStack Senior Living - OpenClaw Skill
 * Voice-powered facility management for senior living
 * @version 1.2.0
 */

const { Skill, Intent, Card } = require('openclaw');

class WellStackSeniorLiving extends Skill {
  constructor() {
    super('wellstack-senior-living');
    this.name = 'WellStack Senior Living';
    this.version = '1.2.0';
  }

  // Check Room Status
  @Intent({
    patterns: [
      'check room {room_number}',
      'status of room {room_number}',
      "what's happening in room {room_number}"
    ],
    slots: { room_number: { type: 'string', required: true } }
  })
  async checkRoomStatus(context, { room_number }) {
    try {
      const roomData = await this.wellstack.getRoomStatus(room_number);
      if (!roomData) {
        return context.say(`I couldn't find room ${room_number}. Please check the number and try again.`);
      }

      const resident = roomData.resident ? `for ${roomData.resident.name}` : '(unoccupied)';
      const ieq = roomData.ieq;
      const alerts = roomData.activeAlerts || [];
      
      const airQuality = ieq.co2 > 1000 ? '⚠️ Poor' : ieq.co2 > 800 ? '⚡ Fair' : '✅ Good';
      const temperature = ieq.temperature < 68 || ieq.temperature > 78 ? '⚠️ Outside range' : '✅ Comfortable';
      
      let response = `**Room ${room_number}** ${resident}\n\n`;
      response += `🌡️ Temperature: ${ieq.temperature}°F (${temperature})\n`;
      response += `💧 Humidity: ${ieq.humidity}%\n`;
      response += `💨 Air Quality (CO2): ${ieq.co2}ppm (${airQuality})\n`;
      response += `💡 Light Level: ${ieq.lux} lux\n\n`;
      
      if (alerts.length > 0) {
        response += `🚨 **Active Alerts (${alerts.length}):**\n`;
        alerts.forEach(alert => {
          response += `  • ${alert.type}: ${alert.message}\n`;
        });
      } else {
        response += `✅ No active alerts`;
      }

      const card = new Card()
        .setTitle(`Room ${room_number}`)
        .setSubtitle(resident)
        .addField('Temperature', `${ieq.temperature}°F`, true)
        .addField('Humidity', `${ieq.humidity}%`, true)
        .addField('CO2', `${ieq.co2} ppm`, true)
        .setColor(alerts.length > 0 ? 'red' : 'green');

      return context.say(response).withCard(card);
    } catch (error) {
      return context.say("I'm having trouble connecting to WellStack. Please try again.");
    }
  }

  // Show Today's Alerts
  @Intent({
    patterns: [
      "show me today's alerts",
      'what alerts do we have',
      'list all alerts'
    ]
  })
  async showTodaysAlerts(context) {
    try {
      const alerts = await this.wellstack.getActiveAlerts();
      if (alerts.length === 0) {
        return context.say('🎉 Great news! No active alerts at this time.');
      }

      const critical = alerts.filter(a => a.priority === 'critical');
      const warning = alerts.filter(a => a.priority === 'warning');

      let response = `🚨 **Active Alerts (${alerts.length})**\n\n`;
      
      if (critical.length > 0) {
        response += `🔴 **CRITICAL (${critical.length}):**\n`;
        critical.forEach(alert => {
          response += `  • Room ${alert.room}: ${alert.message}\n`;
        });
        response += '\n';
      }
      
      if (warning.length > 0) {
        response += `🟡 **WARNING (${warning.length}):**\n`;
        warning.forEach(alert => {
          response += `  • Room ${alert.room}: ${alert.message}\n`;
        });
      }

      return context.say(response);
    } catch (error) {
      return context.say("I'm unable to retrieve alerts right now.");
    }
  }

  // Wellness Check List
  @Intent({
    patterns: [
      'who needs wellness checks',
      'wellness check list',
      "who hasn't had their check today"
    ]
  })
  async getWellnessCheckList(context) {
    try {
      const pendingChecks = await this.wellstack.getPendingWellnessChecks();
      if (pendingChecks.length === 0) {
        return context.say('🎉 All residents have completed their wellness checks today!');
      }

      pendingChecks.sort((a, b) => b.fallRisk - a.fallRisk);

      let response = `📋 **Pending Wellness Checks (${pendingChecks.length})**\n\n`;
      response += `Sorted by fall risk (highest first):\n\n`;
      
      pendingChecks.forEach((check, index) => {
        const riskEmoji = check.fallRisk > 75 ? '🔴' : check.fallRisk > 50 ? '🟡' : '🟢';
        response += `${index + 1}. **Room ${check.room}** - ${check.residentName}\n`;
        response += `   ${riskEmoji} Fall Risk: ${check.fallRisk}/100\n\n`;
      });

      return context.say(response);
    } catch (error) {
      return context.say("I'm unable to retrieve the wellness check list.");
    }
  }

  // Generate IEQ Report
  @Intent({
    patterns: [
      'generate IEQ report',
      'air quality report',
      'WELL compliance report'
    ]
  })
  async generateIEQReport(context) {
    try {
      const report = await this.wellstack.generateIEQReport({
        timeframe: '7d',
        includeWELLCompliance: true
      });

      let response = `📊 **IEQ Report (${report.period})**\n\n`;
      response += `**Facility Overview:**\n`;
      response += `  Average Temperature: ${report.avgTemperature}°F\n`;
      response += `  Average Humidity: ${report.avgHumidity}%\n`;
      response += `  Average CO2: ${report.avgCO2} ppm\n`;
      response += `  Air Quality Score: ${report.airQualityScore}/100\n\n`;

      response += `**WELL v2 Compliance:**\n`;
      response += `  A01 (Air Quality): ${report.wellCompliance.A01 ? '✅ PASS' : '⚠️ ATTENTION'}\n`;
      response += `  T01 (Thermal): ${report.wellCompliance.T01 ? '✅ PASS' : '⚠️ ATTENTION'}\n`;
      response += `  L01 (Light): ${report.wellCompliance.L01 ? '✅ PASS' : '⚠️ ATTENTION'}\n`;

      return context.say(response);
    } catch (error) {
      return context.say("I'm having trouble generating the IEQ report.");
    }
  }

  // Send Family Update
  @Intent({
    patterns: [
      'send update to {family_member}',
      'update {family_member} about {resident_name}'
    ],
    slots: {
      family_member: { type: 'string', required: false },
      resident_name: { type: 'string', required: false }
    }
  })
  async sendFamilyUpdate(context, slots) {
    return context.say('Family update feature - configures notification to family members with daily summaries and wellness metrics.');
  }

  // Medication Reminder
  @Intent({
    patterns: [
      'medication reminder for room {room_number}',
      'remind room {room_number} about meds'
    ],
    slots: { room_number: { type: 'string', required: true } }
  })
  async medicationReminder(context, { room_number }) {
    try {
      const roomData = await this.wellstack.getRoomStatus(room_number);
      if (!roomData.resident) {
        return context.say(`Room ${room_number} is unoccupied.`);
      }

      await this.wellstack.sendRoomNotification(room_number, {
        type: 'medication_reminder',
        message: `Time for your medications, ${roomData.resident.name.split(' ')[0]}`
      });

      return context.say(`💊 Reminder sent to Room ${room_number}.`);
    } catch (error) {
      return context.say("I had trouble sending the medication reminder.");
    }
  }
}

module.exports = new WellStackSeniorLiving();
