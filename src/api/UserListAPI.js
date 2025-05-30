import axios from 'axios';

export default {
    data(){
        return{ 
            user:[],
        };
    },

    created(){
        axios.get('https://6834251a464b4996360183b4.mockapi.io/users')
        .then(response => {
            this.user = response.data;
        })
        .catch(error => {
            console.error('Lỗi khi tải danh sách người dùng:', error);
        });
    },
};
