import React, { useState, useEffect } from "react";
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Linking,
    Keyboard,
    Alert
} from "react-native";
import * as SQLite from "expo-sqlite";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from "react-native-safe-area-context";

function openDatabase() {
    if (Platform.OS === "web") {
        return {
            transaction: () => {
                return {
                    executeSql: () => { },
                };
            },
        };
    }

    const db = SQLite.openDatabase("db.db");
    return db;
}

const db = openDatabase();




function Items({ onDeleteItem }) {
    const [items, setItems] = useState(null);

    useEffect(() => {
        db.transaction((tx) => {
            tx.executeSql("select * from links", [], (_, { rows: { _array } }) =>
                setItems(_array)
            );
        });
    }, []);

    const openLink = async (url) => {
        const supported = await Linking.canOpenURL(url);

        if (supported) {
            // Opening the link with some app, if the URL scheme is "http" the web link should be opened
            // by some browser in the mobile
            await Linking.openURL(url);
        } else {
            Alert.alert(`Don't know how to open this URL: ${url}`);
        }
    }

    if (items === null || items.length === 0) {
        return null;
    }

    return (
        <View style={styles.sectionContainer}>

            {items.map(({ id, link, title }) => (
                <View style={{
                    justifyContent: 'space-between',
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderBottomColor: '#eee',
                    borderBottomWidth: 1
                }}>
                    <TouchableOpacity
                        key={id}
                        onPress={() => openLink && openLink(link)}
                        style={{
                            backgroundColor: "#fff",
                            padding: 8,
                            flex: 0.94,
                        }}
                    >
                        <Text style={{ color: "#000", fontSize: 20 }}>{title} </Text>
                        <Text style={{ color: "#0020c2" }}>{link}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{
                        backgroundColor: "#fff",
                        justifyContent: 'center',
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 5,
                        marginBottom: 5,
                        marginLeft: 5,
                        borderRadius: 5,
                        flex: 0.06,
                    }} onPress={() => onDeleteItem && onDeleteItem(id)}>
                        <MaterialCommunityIcons name="delete" color={'red'} size={20} />
                    </TouchableOpacity>
                </View>
            ))}
        </View>
    );
}

export default function Links() {
    const [title, setTitle] = useState(null);
    const [link, setLink] = useState(null);
    const [forceUpdate, forceUpdateId] = useForceUpdate();

    useEffect(() => {
        db.transaction((tx) => {
            tx.executeSql(
                "create table if not exists links (id integer primary key not null, title text, link text);"
            );
        });
    }, []);

    const add = (title, link) => {
        // is text empty?
        if (title === null || link === null) {
            return false;
        }

        db.transaction(
            (tx) => {
                tx.executeSql("insert into links (title, link) values (?, ?)", [title, link]);
                tx.executeSql("select * from links", [], (_, { rows }) =>
                    console.log(JSON.stringify(rows))
                );
            },
            null,
            forceUpdate
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.listArea}>
                <Items
                    key={`forceupdate-todo-${forceUpdateId}`}
                    onDeleteItem={(id) =>
                        db.transaction(
                            (tx) => {
                                tx.executeSql(`delete from links where id = ?;`, [
                                    id,
                                ]);
                            },
                            null,
                            forceUpdate
                        )
                    }
                />
            </ScrollView>

            <View style={{ height: 120 }}>

                <TextInput
                    onChangeText={(text) => setLink(text)}
                    placeholder="Link"
                    style={styles.input}
                    value={link}
                />
                <View style={{ flexDirection: 'row', }}>
                    <TextInput
                        onChangeText={(text) => setTitle(text)}
                        placeholder="Title"
                        style={styles.input}
                        value={title}
                    />
                    <TouchableOpacity style={styles.button}
                        onPress={() => {
                            add(title, link);
                            setLink(null);
                            setTitle(null);
                            Keyboard.dismiss();
                        }}
                    >
                        <Text style={{ color: '#fff', }}>Save</Text>
                    </TouchableOpacity>
                </View>

            </View>

        </SafeAreaView >
    );
}

function useForceUpdate() {
    const [value, setValue] = useState(0);
    return [() => setValue(value + 1), value];
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#fff",
        flex: 1,
    },
    heading: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
    },
    flexRow: {
        flexDirection: "row",
    },
    input: {
        borderColor: "#4630eb",
        borderRadius: 4,
        borderWidth: 1,
        flex: 1,
        height: 48,
        marginHorizontal: 16,
        marginVertical: 5,
        padding: 8,
    },
    button: {
        borderColor: "#4630eb",
        backgroundColor: "#4630eb",
        borderRadius: 4,
        borderWidth: 1,
        flex: 0.2,
        height: 48,
        marginVertical: 5,
        marginRight: 16,
        alignItems: 'center',
        justifyContent: 'center'
    },
    listArea: {
        backgroundColor: "#fff",
        flex: 1,
        paddingTop: 16,
    },
    sectionContainer: {
        marginBottom: 16,
        marginHorizontal: 16,
    },
    sectionHeading: {
        fontSize: 18,
        marginBottom: 8,
    },
});