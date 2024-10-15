import React, { useState } from "react";
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";
import { Card, Box, Typography, Divider } from "@mui/material";
import {
  BookRounded,
  MessageRounded,
  LocalHospital,
  Person,
} from "@mui/icons-material";
import { Transcriptions } from "./App";
import { Button } from "@mui/material"; // Make sure to import Button

// Define styles for PDF rendering
import dayjs, { Dayjs } from "dayjs";

const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  section: {
    marginBottom: 20,
    padding: 10,
    border: "1px solid #ccc",
    borderRadius: 4,
  },
  header: {
    fontSize: 20,
    marginBottom: 12,
  },
  text: {
    fontSize: 12,
    lineHeight: 1.5,
    color: "#333",
  },
  transcriptionBox: {
    marginTop: 10,
    paddingBottom: 8,
    borderBottom: "1px solid #ccc",
  },
  transcriptionSpeaker: {
    fontSize: 14,
    marginBottom: 4,
  },
  transcriptionTime: {
    fontSize: 10,
    color: "#777",
  },
  transcriptionText: {
    fontSize: 12,
    marginTop: 4,
    color: "#555",
  },
  infoText: {
    fontSize: 14,
    marginBottom: 8,
  },
});

const formatTimestamp = (timestamp: number): string => {
  const minutes = Math.floor(timestamp / 60); // Get whole minutes
  const seconds = Math.floor(timestamp % 60); // Get remaining seconds
  const formattedMinutes = String(minutes).padStart(2, "0"); // Pad minutes
  const formattedSeconds = String(seconds).padStart(2, "0"); // Pad seconds
  return `${formattedMinutes}:${formattedSeconds}`;
};

// Combined Component
const SummaryAndTranscriptionPDF = ({
  summary,
  transcriptions,
  selectedDate,
  personName,
  selectedTime,
}: {
  summary: string;
  transcriptions: Transcriptions[];
  selectedDate: Dayjs | null;
  personName: string;
  selectedTime: string;
}) => (
  <Document>
    {/* Page 1 - Summary */}
    <Page size="A4" style={styles.page}>
      {/* Displaying the state values on the top */}
      <View style={styles.section}>
        <Text style={styles.infoText}>
          Date: {selectedDate?.format("YYYY-MM-DD")}
        </Text>
        <Text style={styles.infoText}>Person: {personName}</Text>
        <Text style={styles.infoText}>Time: {selectedTime}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.header}>Summary</Text>
        <Text style={styles.text}>{summary}</Text>
      </View>
    </Page>

    {/* Page 2 and beyond - Transcriptions */}
    <Page size="A4" style={styles.page} wrap>
      {/* Displaying the state values on the top of the transcription page */}
      <View style={styles.section}>
        <Text style={styles.infoText}>
          Date: {selectedDate?.format("YYYY-MM-DD")}
        </Text>
        <Text style={styles.infoText}>Person: {personName}</Text>
        <Text style={styles.infoText}>Time: {selectedTime}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.header}>Transcriptions</Text>
        {transcriptions.map((transcription, index) => (
          <View key={index} style={styles.transcriptionBox}>
            <Text style={styles.transcriptionSpeaker}>
              {transcription.speaker}
            </Text>
            <Text style={styles.transcriptionTime}>
              {formatTimestamp(transcription.timestamp[0])} -{" "}
              {formatTimestamp(transcription.timestamp[1])}
            </Text>
            <Text style={styles.transcriptionText}>
              {transcription.transcription}
            </Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

// PDF Download Link Component
export const PDFFile = ({
  summary,
  transcriptions,
  selectedDate,
  personName,
  selectedTime,
}: {
  summary: string;
  transcriptions: Transcriptions[];
  selectedDate: Dayjs | null;
  personName: string;
  selectedTime: string;
}) => {
  return (
    <SummaryAndTranscriptionPDF
      summary={summary}
      transcriptions={transcriptions}
      selectedDate={selectedDate}
      personName={personName}
      selectedTime={selectedTime}
    />
  );
};
