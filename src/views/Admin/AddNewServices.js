import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import { launchImageLibrary } from 'react-native-image-picker';

const AddNewServices = ({ navigation }) => {
    const [service, setService] = useState('');
    const [prices, setPrices] = useState('');
    const [imageUri, setImageUri] = useState(null);

    const pickImage = () => {
        launchImageLibrary({ mediaType: 'photo' }, (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.errorMessage) {
                console.log('ImagePicker Error: ', response.errorMessage);
            } else if (response.assets && response.assets.length > 0) {
                const selectedImage = response.assets[0];
                setImageUri(selectedImage.uri);
            }
        });
    };

    const uploadImage = async (uri) => {
        const filename = uri.substring(uri.lastIndexOf('/') + 1);
        const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
        const storageRef = storage().ref(`services/${filename}`);
        await storageRef.putFile(uploadUri);
        return await storageRef.getDownloadURL();
    };

    const addService = async () => {
        if (service.trim() === '' || prices.trim() === '') {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        let imageUrl = '';
        if (imageUri) {
            try {
                imageUrl = await uploadImage(imageUri);
            } catch (error) {
                console.error('Error uploading image:', error);
                Alert.alert('Error', 'An error occurred while uploading the image');
                return;
            }
        }

        try {
            await firestore()
                .collection('services')
                .add({
                    service: service.trim(),
                    prices: prices.trim(),
                    imageUrl,
                });

            // Show success message and navigate back to the Home screen
            Alert.alert('Success', 'Service added successfully');
            navigation.navigate('Home');
        } catch (error) {
            console.error('Error adding service:', error);
            Alert.alert('Error', 'An error occurred while adding the service');
        }
    };

    return (
        <View style={styles.container}>
            <View >
                <TouchableOpacity onPress={() => navigation.goBack()}>
                      <Image
                        source={require('../../image/back_arrow.jpg')} 
                        style={{ width: 35, height: 30 }}
                      />
                </TouchableOpacity>
            </View>
            <View style={styles.bottomContainer}>
                <Text style={{ fontWeight: 'bold' }}>Tên dịch vụ*</Text>
                <TextInput
                    placeholder="Tên dịch vụ"
                    onChangeText={setService}
                    value={service}
                    style={styles.input}
                />

                <Text style={{ fontWeight: 'bold' }}>Giá*</Text>
                <TextInput
                    placeholder="0"
                    onChangeText={setPrices}
                    value={prices}
                    style={styles.input}
                    keyboardType="number-pad"
                />

                <TouchableOpacity onPress={pickImage} style={styles.button}>
                    <Text style={{ fontSize: 20, color: 'white' }}>Chọn ảnh</Text>
                </TouchableOpacity>

                {imageUri && (
                    <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                )}

                <View style={styles.buttonsContainer}>
                    <TouchableOpacity onPress={addService} style={styles.button}>
                        <Text style={{ fontSize: 20, color: 'white' }}>Thêm</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    input: {
        height: 40,
        width: '100%',
        borderColor: 'black',
        borderWidth: 1,
        marginBottom: 10, // Khoảng cách giữa các TextInput
        paddingHorizontal: 10,
        borderRadius: 10,
    },
    topContainer: {
        justifyContent: 'flex-start',
        alignSelf: 'stretch',
        backgroundColor: '#FFC0CB',
    },
    bottomContainer: {
        width: '100%',
        paddingHorizontal: 10,
        marginTop: 50,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 30,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderWidth: 1,
        height: 45,
        backgroundColor: '#FFC0CB',
        borderColor: '#075eec',
        marginTop: 10,
    },
    buttonsContainer: {
        marginTop: 10,
    },
    backButton: {
        position: 'absolute',
        left: 10,
        top: 10,
    },
    imagePreview: {
        width: '100%',
        height: 200,
        marginTop: 10,
        borderRadius: 10,
    },
});

export default AddNewServices;
